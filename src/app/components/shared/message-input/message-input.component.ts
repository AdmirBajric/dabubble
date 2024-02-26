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
import { Channel } from '../../../models/channel.class';
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
  @Input() styleHeaderForThread: boolean = false;
  @Output() closeThread: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() messageText: EventEmitter<string> = new EventEmitter<string>();
  // can be used in 'directMessages', 'channel', 'thread'
  @Input() usedLocation!: string;
  @Output() commentData = new EventEmitter<{
    commentText: string;
    commentFile: string;
  }>();
  @ViewChild('userInputField') userInputField!: ElementRef<HTMLInputElement>;

  currentChannel: Channel | null = null;
  channelSubscription: Subscription | undefined;
  channelsSubscription: Subscription | undefined;
  placeholder: string = 'Nachricht an #Entwicklerteam';
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

  firestore: Firestore = inject(Firestore);

  constructor(
    private firebaseService: FirebaseService,
    private navService: chatNavigationService
  ) {}

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
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.channelsSubscription) {
      this.channelsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.userInputField.nativeElement.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.checkInputAndSyncArrays();
      }
    });
  }

  checkInputAndSyncArrays() {
    const inputValue = this.userInputField.nativeElement.value;
    const mentionedUsersChannels = this.extractMentions(inputValue);
    this.syncArrays(mentionedUsersChannels);
  }

  extractMentions(input: string) {
    return input.split(/[@#]/);
  }

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
    console.log(this.users);
  }

  makeCloneCopy() {
    this.copyOfChannels = [...this.channels];
    this.copyOfUsers = [...this.users];
  }

  onInputChange(event: any) {
    const values = event.target.value.split(' ');

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

  onInputFocus() {
    this.isInputFocused = true;
    this.usersSearch = false;
    this.channelSearch = false;
    this.showEmoji = false;
  }

  onInputBlur() {
    this.isInputFocused = false;
  }

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

  toggleExpandPanel() {
    if (this.users.length > 0) {
      this.usersSearch = !this.usersSearch;
    }
  }

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

  addFreeSpace() {
    if (this.userInputField) {
      if (this.text.length > 0) {
        this.text += ' ';
      }
      this.userInputField.nativeElement.focus();
    }
  }

  addEmoji(event: any): void {
    this.emoji = event.emoji.native;
    this.showEmoji = false;
    this.text += this.emoji;
    this.addFreeSpace();
  }

  toggleEmojiContainer() {
    this.showEmoji = !this.showEmoji;
  }

  subscribeChannel() {
    this.channelSubscription = this.navService.currentChannel.subscribe(
      (channel) => {
        this.currentChannel = channel;
      }
    );
  }

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

  async addMessage(channel: boolean) {
    this.usersSearch = false;
    this.channelSearch = false;
    this.showEmoji = false;

    if (this.userInputField) {
      this.text = this.userInputField.nativeElement.value;
    }

    if (this.text.length > 0 || this.selectedFile !== null) {
      await this.uploadImage();

      if (this.text.length > 0) {
        const message = new Message({
          text: this.text,
          timestamp: new Date(),
          creator: this.user,
          channelId: this.currentChannel?.id,
          isChannelMessage: channel,
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
  }

  async prepareData() {
    const channel = this.checkIfChannel();
    await this.uploadImage(); // saves file within local variable
    if (this.text.length > 0) {
      if (channel) {
        const message = this.packMessageData(channel);
        const messageToJson = message.toJSON();
        this.sendMessage(messageToJson);
      } else if (this.usedLocation === 'thread') {
        const commentText = this.text;
        const commentFile = this.uploadedFile;
        this.commentData.emit({ commentText, commentFile })
      }
      this.text = '';
    }
  }

  sendMessage(messageToJson: Message) {
    this.firebaseService
      .addDocument('messages', messageToJson)
      .then((data: any) => {
        this.messageId = data.id;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  packMessageData(channel: boolean) {
    return new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.user,
      channelId: this.currentChannel?.id,
      isChannelMessage: channel,
      reactions: [],
      file: this.uploadedFile,
    });
  }


  checkIfChannel() {
    if (this.usedLocation === 'channel') {
      return true;
    } else {
      return false;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Set the text to indicate that a file has been added
      this.textForFile = 'File added';
    } else {
      // Set the text to indicate that no file has been added
      this.textForFile = 'No file selected';
    }
  }

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
