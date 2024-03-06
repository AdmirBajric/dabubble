import {
  Component,
  Output,
  OnInit,
  EventEmitter,
  inject,
  Input,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { FormGroup } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    FormsModule,
    HoverChangeDirective,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    PickerComponent,
    CommonModule,
    MatExpansionModule,
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent implements OnInit {
  @Output() closeThread: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() messageText: EventEmitter<string> = new EventEmitter<string>();
  @Output() commentData = new EventEmitter<{
    commentText: string;
    commentFile: string;
  }>();
  @Output() newMessageData = new EventEmitter<{
    text: string;
    file: string;
    error: boolean;
  }>();
  // can be used in 'directMessages', 'channel', 'thread', 'newMessage'
  @Input() usedLocation!: string;
  @Input() id!: string;
  @Input() styleHeaderForThread: boolean = false;
  @ViewChild('userInputField') userInputField!: ElementRef<HTMLInputElement>;

  currentChannel: any | null = null;
  channelSubscription: Subscription | undefined;
  channelsSubscription: Subscription | undefined;
  placeholder!: string;
  text: string = '';
  textForFile: string = '';
  form!: FormGroup;
  uploadedFile: string = '';
  user!: any;
  messageId: string = '';
  selectedFile: File | null = null;
  previewImageUrl: any;
  showEmoji: boolean = false;
  emoji: string = '';
  showUserInput: string[] = [];
  usersSearch: boolean = false;
  channelSearch: boolean = false;
  users: any[] = [];
  channels: any[] = [];
  isInputFocused: boolean = false;
  copyOfChannels: any[] = [];
  copyOfUsers: any[] = [];
  filteredUser: any[] = [];
  newMsgOrMsg: boolean = true;
  noInput: boolean = false;

  firestore: Firestore = inject(Firestore);

  constructor(
    private firebaseService: FirebaseService,
    private navService: chatNavigationService,
    private elementRef: ElementRef
  ) {}

  /**
   * Lifecycle hook that initializes component state by loading the logged-in user from localStorage,
   * subscribing to channel updates, setting user and channel data, and generating a placeholder based on the context.
   */
  ngOnInit(): void {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }

    this.subscribeChannel();
    this.subscribeChannels();
    this.setUserAndChannels();
    this.generatePlaceholder();
  }

  /**
   * Lifecycle hook that performs cleanup by unsubscribing from any observable subscriptions
   * and resetting placeholder text to prevent memory leaks.
   */
  ngOnDestroy() {
    this.placeholder = '';
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.channelsSubscription) {
      this.channelsSubscription.unsubscribe();
    }
  }

  /**
   * Lifecycle hook that adds an event listener to the user input field for handling deletion via keyboard,
   * syncing user and channel arrays based on the input.
   */
  ngAfterViewInit() {
    this.userInputField.nativeElement.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.checkInputAndSyncArrays();
      }
    });
  }

  /**
   * Generates a context-specific placeholder for the message input field based on the current location.
   */
  generatePlaceholder() {
    if (this.usedLocation === 'channel') {
      this.placeholder = this.getChannelPlaceholder();
    } else if (this.usedLocation === 'thread') {
      this.placeholder = `Antworten...`;
    } else if (this.usedLocation === 'newMessage') {
      this.placeholder = `Starte eine neue Nachricht`;
    } else if (this.usedLocation === 'directMessages') {
      this.placeholder = `Nachricht an ${this.currentChannel.fullName}`;
    }
  }

  /**
   * Retrieves a channel-specific placeholder, indicating the target channel for the message.
   * @returns {string} - placeholder string indicating the target channel.
   */
  getChannelPlaceholder() {
    if (this.currentChannel) {
      const name = this.currentChannel.name;
      return `Nachricht an #${name}`;
    } else {
      return `Schreibe eine Nachricht`;
    }
  }

  /**
   * Synchronizes the mentioned users and channels arrays with the current input, ensuring only relevant entities remain.
   */
  checkInputAndSyncArrays() {
    const inputValue = this.userInputField.nativeElement.value;
    const mentionedUsersChannels = this.extractMentions(inputValue);
    this.syncArrays(mentionedUsersChannels);
  }

  /**
   * Extracts mentions from the input string based on predefined delimiters (@ for users, # for channels).
   * @param {string} input - input string from the user.
   * @returns {string[]} - array of extracted mentions.
   */
  extractMentions(input: string) {
    return input.split(/[@#]/);
  }

  /**
   * Updates the users array to include only those mentioned or originally included, based on the latest input.
   * @param {string[]} mentionedUsersChannels - array of mentioned users or channels in the input.
   */
  syncArrays(mentionedUsersChannels: string[]) {
    const mentionedUserIds: Set<string> = new Set();

    mentionedUsersChannels.forEach((mention) => {
      this.copyOfUsers.forEach((user) => {
        if (user.fullName.toLowerCase() === mention.toLowerCase()) {
          mentionedUserIds.add(user.id);
        }
      });
    });

    const filteredUsers = this.copyOfUsers.filter((user) => {
      return (
        mentionedUserIds.has(user.id) ||
        this.users.some((u) => u.id === user.id)
      );
    });

    this.users = [...filteredUsers];
  }

  /**
   * Creates a deep copy of the channels and users arrays to preserve the original data for reference.
   */
  makeCloneCopy() {
    this.copyOfChannels = [...this.channels];
    this.copyOfUsers = [...this.users];
  }

  /**
   * Handles changes in the input field, toggling search modes for users and channels based on specific triggers.
   * @param {Event} event The input event containing the new value of the field.
   */
  onInputChange(event: any) {
    const values = event.target.value.split(' ');
    this.noInput = false;

    values.forEach((value: string) => {
      if (value === '@' && this.users.length > 0) {
        this.usersSearch = true;
      } else {
        this.usersSearch = false;
      }

      if (value === '#' && this.channels.length > 0) {
        this.channelSearch = true;
      } else {
        this.channelSearch = false;
      }
    });
  }

  /**
   * Sets the input focus state to true and resets search indicators and emoji visibility.
   */
  onInputFocus() {
    this.isInputFocused = true;
    this.usersSearch = false;
    this.channelSearch = false;
    this.showEmoji = false;
  }

  /**
   * Resets the input focus state to false when the input field loses focus.
   */
  onInputBlur() {
    this.isInputFocused = false;
  }

  /**
   * Fetches all users and channels from the Firebase service and creates a clone copy for reference.
   */
  async setUserAndChannels() {
    await this.firebaseService
      .getAllUsers()
      .then((users: any[]) => {
        this.users = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

    await this.firebaseService
      .getAllChannels()
      .then((channels: any[]) => {
        this.channels = channels;
      })
      .catch((error) => {
        console.error('Error fetching channels:', error);
      });

    this.makeCloneCopy();
  }

  /**
   * Toggles the user search panel expansion based on the presence of users.
   */
  toggleExpandPanel() {
    if (this.users.length > 0) {
      this.usersSearch = !this.usersSearch;
    }
  }

  /**
   * Adds a user to the input text when selected from the search results, auto-inserting the '@' symbol if necessary.
   * @param {string} userId - ID of the user to add.
   */
  addUser(userId: any) {
    const selectedUserIndex = this.users.findIndex(
      (user) => user.id === userId
    );

    if (this.users.length === 1) {
      this.usersSearch = false;
    }

    if (selectedUserIndex !== -1) {
      const selectedUser = this.users.splice(selectedUserIndex, 1)[0];
      const lastCharacterIsAtSymbol = this.text.trim().endsWith('@');
      if (!lastCharacterIsAtSymbol) {
        this.text += '@';
      }
      this.text += selectedUser.fullName + ' ';
    }
  }

  /**
   * Adds a channel to the input text when selected from the search results, auto-inserting the '#' symbol if necessary.
   * @param {string} channelName - name of the channel to add.
   */
  addChannel(channelName: string) {
    const selectedChannelIndex = this.channels.findIndex(
      (channel) => channel.name === channelName
    );

    if (this.channels.length === 1) {
      this.channelSearch = false;
    }

    if (selectedChannelIndex !== -1) {
      const selectedChannel = this.channels.splice(selectedChannelIndex, 1)[0];
      const lastCharacterIsHashSymbol = this.text.trim().endsWith('#');
      if (!lastCharacterIsHashSymbol) {
        this.text += '#';
      }
      this.text += selectedChannel.name + ' ';
    }
  }

  /**
   * Adds a space to the input text and ensures the input field remains focused.
   */
  addFreeSpace() {
    if (this.userInputField) {
      if (this.text.length > 0) {
        this.text += ' ';
      }
      this.userInputField.nativeElement.focus();
    }
  }

  /**
   * Adds the selected emoji to the input text and prepares the input field for further typing.
   * @param {any} event The emoji selection event.
   */
  addEmoji(event: any): void {
    this.emoji = event.emoji.native;
    this.showEmoji = false;
    this.text += this.emoji;
    this.addFreeSpace();
  }

  /**
   * Toggles the visibility of the emoji picker based on the provided context (e.g., thread, new message).
   * @param {string} location The context in which the emoji picker is being toggled.
   */
  toggleEmojiContainer(location: string) {
    if (location === 'thread') {
      this.newMsgOrMsg = !this.newMsgOrMsg;
    }
    this.showEmoji = !this.showEmoji;
  }

  /**
   * Subscribes to the current channel observable to receive updates and generate a context-specific placeholder.
   */
  subscribeChannel() {
    this.channelSubscription = this.navService.currentChannel.subscribe(
      (channel) => {
        this.currentChannel = channel;
        this.generatePlaceholder();
      }
    );
  }

  /**
   * Subscribes to the channel updates observable to receive a list of updated channels and refresh the current channel data.
   */
  subscribeChannels() {
    this.channelsSubscription = this.navService.channelsUpdated$.subscribe(
      (channels) => {
        const id = this.currentChannel?.id;
        channels.forEach((channel) => {
          if (channel.id === id) {
            this.currentChannel = channel;
          }
        });
      }
    );
  }

  /**
   * Processes and sends the composed message or comment, handling file uploads and resetting the input state.
   * @param {boolean} channel Indicates whether the message is for a channel or direct message.
   */
  async addMessage(channel: boolean) {
    if (this.text.length === 0 && this.selectedFile === null) {
      this.noInput = true;
    } else {
      this.noInput = false;

      this.usersSearch = false;
      this.channelSearch = false;
      this.showEmoji = false;

      if (this.userInputField) {
        this.text = this.userInputField.nativeElement.value;
      }

      if (
        this.currentChannel.isUser &&
        this.usedLocation === 'directMessages'
      ) {
        if (this.text.length > 0 || this.selectedFile !== null) {
          await this.uploadImage();

          if (this.text.length > 0) {
            const message = new Message({
              text: this.text,
              timestamp: new Date(),
              creator: this.user,
              recipient: this.currentChannel,
              isChannelMessage: false,
              privateMsg: true,
              myMsg: this.user.id === this.currentChannel.id ? true : false,
              reactions: [],
              file: this.uploadedFile,
            });

            const messageToJson = message.toJSON();

            this.firebaseService
              .addDocument('messages', messageToJson)
              .then((data: any) => {
                this.messageId = data.id;
                this.text = '';
                this.textForFile = '';
                if (this.selectedFile === null) {
                  this.uploadedFile = '';
                }
              })
              .catch((err: any) => {
                console.log(err);
              });
          }
        }
      } else if (this.usedLocation === 'channel') {
        if (this.text.length > 0 || this.selectedFile !== null) {
          await this.uploadImage();

          if (this.text.length > 0) {
            const message = new Message({
              text: this.text,
              timestamp: new Date(),
              creator: this.user,
              channelId: this.currentChannel?.id,
              isChannelMessage: channel,
              privateMsg: false,
              myMsg: false,
              reactions: [],
              file: this.uploadedFile,
            });

            const messageToJson = message.toJSON();

            this.firebaseService
              .addDocument('messages', messageToJson)
              .then((data: any) => {
                this.messageId = data.id;
                this.text = '';
                this.textForFile = '';
                if (this.selectedFile === null) {
                  this.uploadedFile = '';
                }
              })
              .catch((err: any) => {
                console.log(err);
              });
          }
        }
      } else if (
        this.usedLocation === 'newMessage' ||
        this.usedLocation === 'thread'
      ) {
        if (this.text.length > 0 || this.selectedFile !== null) {
          const commentText = this.text;
          const commentFile = this.uploadedFile;
          this.commentData.emit({ commentText, commentFile });
          this.text = '';
        }
      }
    }
  }

  /**
   * Emits the composed text and any selected file to the parent component when used for composing a new message.
   */
  // this is used when user wants to write new message. usedLocation === 'newMessage'
  async emitText() {
    await this.uploadImage();
    if (this.text.length > 0) {
      const text = this.text;
      const file = this.uploadedFile;
      const error = false;
      this.newMessageData.emit({ text, file, error });
      this.text = '';
    } else {
      const text = '';
      const file = '';
      const error = true;
      this.newMessageData.emit({ text, file, error });
    }
  }

  /**
   * Handles file selection, updating the UI to reflect the selected file and preparing it for upload.
   * @param {Event} event The file input change event.
   */
  selectedInputElement: HTMLInputElement | null = null;

  onFileSelected(event: any) {
    const selectedInputElement = event.target;
    this.selectedFile = selectedInputElement.files?.[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        selectedInputElement.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      selectedInputElement.noInput = true;
    }
  }

  /**
   * Uploads the selected image file to Firebase storage and updates the `uploadedFile` URL for message attachment.
   */
  async uploadImage() {
    if (this.selectedFile !== null) {
      const filename = this.user.id + '_' + this.selectedFile.name;
      const firebaseApp = getApp();
      const storage = getStorage(
        firebaseApp,
        'gs://dabubble-cee4e.appspot.com'
      );
      const storageRef = ref(storage, 'images/' + filename);
      await uploadBytes(storageRef, this.selectedFile)
        .then(async (snapshot) => {
          this.uploadedFile = await getDownloadURL(storageRef);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  }
}
