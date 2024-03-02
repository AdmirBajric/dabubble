import {
  Component,
  AfterViewInit,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../models/message.class';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { chatNavigationService } from '../../../services/chat-navigation.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() placeholder!: string; //***** gives placeholder according to component: if it's used in /dashboard or /new-message
  @Input() showLoupe!: boolean; //****** true if it's in /dashboard; false if it's in /new-message
  @Input() showBorder!: boolean; //******  true if it's in /new-message (.border-light); false if it's in dashboard (.border-white)
  @Input() searchRecipients: boolean = false; //******  only true if used to search for message recipints in new-message
  @Input() globalSearch!: boolean; //****** true if searchbar is used globally for channels, members, messages, information
  @Input() newMessageSearch!: boolean; //****** true if searchbar is used in new-message.component
  @ViewChild('searchbarInput') searchbarInput!: ElementRef<HTMLInputElement>;
  users!: User[];
  channels!: Channel[];

  copyOfChannels!: any[];
  copyOfUsers!: any[];
  copyOfChannelMessages: Message[] = [];
  copyOfPrivateMessages: Message[] = [];

  usersSearch: boolean = false;
  channelSearch: boolean = false;
  inputValue!: string;

  isSearchbarEmpty: boolean = true;

  selectedRecipients: User[] = [];
  selectedChannels: Channel[] = [];
  backendMessages: Message[] = [];
  channelMessages: Message[] = [];
  privateMessages: Message[] = [];
  loggedUser!: User;

  filteredChannelsList: Channel[] = [];
  filteredChannelMessagesList: Message[] = [];
  filteredUsersList: User[] = [];
  filteredPrivateMessagesList: Message[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private btnService: ButtonFunctionService,
    private navService: chatNavigationService
  ) {}

  /**
   * Initializes the component by attempting to retrieve and parse the 'loggedInUser' from localStorage.
   * If a user is found, their data is set to the component's `loggedUser` property and `getData` method is called.
   */
  ngOnInit() {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.loggedUser = parsedUser;
      this.getData();
    }
  }

  /**
   * Sets up an event listener for the searchbar input to handle deletion via the 'Delete' or 'Backspace' keys,
   * invoking `checkInputAndSyncArraysUsersAndChannels` to synchronize the input with the user and channel arrays.
   */
  ngAfterViewInit() {
    this.searchbarInput.nativeElement.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.checkInputAndSyncArraysUsersAndChannels();
      }
    });
  }

  /**
   * Opens the user profile using the provided user ID through the button service.
   * @param {string} id - The unique identifier of the user whose profile needs to be displayed.
   */
  showUserProfile(id: string) {
    this.btnService.openProfile(id);
  }

  /**
   * Retrieves and sets data based on the component's current mode, which can involve setting up users and channels,
   * messages, or both, by calling respective methods.
   */
  async getData() {
    if (this.newMessageSearch) {
      await this.setUserAndChannels();
      this.makeCloneCopy('U&C');
    } else if (this.globalSearch) {
      await this.setUserAndChannels();
      await this.setMessages();
    }
  }
  /**
   * Fetches messages from the Firebase service, extracts their IDs, and retrieves each message's detailed data.
   */
  async setMessages() {
    await this.firebaseService
      .getDocuments('messages')
      .then((messages) => {
        const ids = this.getMessageIDs(messages);
        ids.forEach((id: string) => this.getMessageObjects(id));
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }
  /**
   * Extracts message IDs from the provided message objects array.
   * @param {Array} data -  array of message objects from which IDs are to be extracted.
   * @returns {Array} - array of message IDs.
   */
  getMessageIDs(data: any) {
    return data.map((message: any) => {
      return message.id;
    });
  }

  /**
   * Retrieves detailed message data for a given message ID and constructs a message object,
   * which is then pushed into the `backendMessages` array.
   * @param {string} id -  unique identifier of the message to retrieve.
   */
  async getMessageObjects(id: string) {
    const snapShot = await this.firebaseService.getDocument('messages', id);
    if (snapShot.exists()) {
      const data = snapShot.data();
      const message = new Message({
        text: data['text'],
        timestamp: data['timestamp'],
        creator: data['creator'],
        channelId: data['channelId'],
        recipient: data['recipient'],
        reactions: data['reactions'],
        isChannelMessage: data['isChannelMessage'],
        edited: data['edited'],
        privateMsg: data['privateMsg'],
        id: id,
        file: data['file'],
      });
      this.backendMessages.push(message);
    }
    this.sortbackEndMessages();
  }

  /**
   * Sorts the `backendMessages` array and categorizes each message as either a channel message or a private message.
   */
  sortbackEndMessages() {
    this.backendMessages.forEach(async (message) => {
      await this.categorizeMessage(message);
    });
    this.makeCloneCopy('DM&CM');
  }

  /**
   * Categorizes a given message into either channel messages or private messages based on its properties.
   * @param {Message} message - The message object to be categorized.
   */
  categorizeMessage(message: Message) {
    if (message.isChannelMessage) {
      if (!this.channelMessages.find((m) => m.id === message.id)) {
        this.channelMessages.push(message);
      }
    } else if (message.privateMsg) {
      const personalMessage = this.getPersonalMessages(message) as Message;
      if (
        personalMessage &&
        !this.privateMessages.find((m) => m.id === message.id)
      ) {
        this.privateMessages.push(personalMessage);
      }
    }
  }

  /**
   * Determines if a given message is a personal message based on the logged-in user's name matching either the creator or recipient.
   * @param {Message} message - message object to check.
   * @returns {Message | null} - message if it's personal, otherwise null.
   */
  getPersonalMessages(message: Message): Message | null {
    const loggedName = this.loggedUser.fullName;
    if (
      message.creator?.fullName === loggedName ||
      message.recipient?.fullName === loggedName
    ) {
      return message;
    } else {
      return null;
    }
  }

  /**
   * Fetches all users and channels from the Firebase service and creates clone copies for manipulation.
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
    this.makeCloneCopy('U&C');
  }

  /**
   * Synchronizes the mentioned users and channels with the current input, ensuring only relevant entities are included in the arrays.
   */
  checkInputAndSyncArraysUsersAndChannels() {
    const inputValue = this.searchbarInput.nativeElement.value;
    const mentionedUsersChannels = this.getMentions(inputValue);
    this.syncArrays(mentionedUsersChannels);
  }

  /**
   * Extracts mentions from the input string based on predefined delimiters (@ for users, # for channels).
   * @param {string} inputValue - input string from the user.
   * @returns {Array} - array of extracted mentions.
   */
  getMentions(inputValue: string) {
    return inputValue.split(/[@#]/);
  }

  /**
   * Updates the users array to include only those mentioned or originally included, based on the latest input.
   * @param {Array} mentionedUsersChannels - array of mentioned users or channels in the input.
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
   * Creates a clone copy of users and channels or direct and channel messages based on the provided type.
   * @param {string} typeOfCopy - Indicates the type of data to clone: 'U&C' for users and channels, 'DM&CM' for direct and channel messages.
   */
  makeCloneCopy(typeOfCopy: string) {
    if (typeOfCopy === 'U&C') {
      this.copyOfChannels = [...this.channels];
      this.copyOfUsers = [...this.users];
    } else if (typeOfCopy === 'DM&CM') {
      this.copyOfChannelMessages = [...this.channelMessages];
      this.copyOfPrivateMessages = [...this.privateMessages];
    }
  }

  /**
   * Handles the search operation based on the current mode of the component, such as global search or potential member search.
   */
  search() {
    if (this.globalSearch) {
      const inputValue = this.searchbarInput.nativeElement.value;
      this.isSearchbarEmpty = inputValue.length === 0;
      this.checkInputAndSyncArraysMessages(inputValue);
    }
  }

  /**
   * Filters messages, users, and channels based on the input value, updating the respective filtered lists for display.
   * @param {string} input - The user's input used for filtering.
   */
  checkInputAndSyncArraysMessages(input: string) {
    const lowerCaseInput = input.toLowerCase();
    const userName = this.loggedUser?.fullName.toLowerCase();

    // Filtern der Kanalnachrichten basierend auf dem Input
    const filteredChannelMessages = this.copyOfChannelMessages.filter(
      (message) =>
        message.creator.fullName.toLowerCase().includes(lowerCaseInput) ||
        message.text.toLowerCase().includes(lowerCaseInput)
    );

    const filteredPrivateMessages = this.copyOfPrivateMessages.filter(
      (message) =>
        (message.creator?.fullName.toLowerCase() !==
          this.loggedUser.fullName.toLowerCase() &&
          message.creator?.fullName.toLowerCase().includes(lowerCaseInput)) ||
        (message.recipient &&
          message.recipient.fullName.toLowerCase() !==
            this.loggedUser.fullName.toLowerCase() &&
          message.recipient.fullName.toLowerCase().includes(lowerCaseInput)) ||
        message.text.toLowerCase().includes(lowerCaseInput)
    );

    const filteredChannels = this.copyOfChannels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(lowerCaseInput) ||
        channel.description.toLowerCase().includes(lowerCaseInput)
    );

    const filteredUsers = this.copyOfUsers.filter((user) =>
      user.fullName.toLowerCase().includes(lowerCaseInput)
    );

    this.filteredChannelMessagesList = filteredChannelMessages;
    this.filteredPrivateMessagesList = filteredPrivateMessages;
    this.filteredChannelsList = filteredChannels;
    this.filteredUsersList = filteredUsers;
  }

  /**
   * Selects a user for messaging, adding them to the selected recipients and removing them from the copy of users.
   * @param {string} userName - The full name of the user to select.
   */

  selectUser(userName: string) {
    this.usersSearch = false;
    const userIndex = this.copyOfUsers.findIndex(
      (user) => user.fullName === userName
    );
    if (userIndex !== -1) {
      const selectedUser = this.copyOfUsers[userIndex];
      this.selectedRecipients.push(selectedUser);
      this.copyOfUsers.splice(userIndex, 1);
      this.inputValue = '';
    }
  }

  /**
   * Removes a selected recipient from the messaging list, adding them back to the copy of users.
   * @param {string} userName - The full name of the user to remove.
   */
  removeRecipient(userName: string) {
    const recipientIndex = this.selectedRecipients.findIndex(
      (recipient) => recipient.fullName === userName
    );
    if (recipientIndex !== -1) {
      const user = this.selectedRecipients[recipientIndex];
      this.copyOfUsers.push(user);
      this.selectedRecipients.splice(recipientIndex, 1);
    }
  }

  /**
   * Selects a channel for messaging, adding it to the selected channels and removing it from the copy of channels.
   * @param {string} channelName - The name of the channel to select.
   */
  selectChannel(channelName: string) {
    this.channelSearch = false;
    const channelIndex = this.copyOfChannels.findIndex(
      (channel) => channel.name === channelName
    );
    if (channelIndex !== -1) {
      const selectedChannel = this.copyOfChannels[channelIndex];
      this.selectedChannels.push(selectedChannel);
      this.copyOfChannels.splice(channelIndex, 1);
      this.inputValue = '';
    }
  }

  /**
   * Removes a selected channel from the messaging list, adding it back to the copy of channels.
   * @param {string} channelName - The name of the channel to remove.
   */
  removeChannel(channelName: string) {
    const channelIndex = this.selectedChannels.findIndex(
      (channel) => channel.name === channelName
    );
    if (channelIndex !== -1) {
      const channel = this.selectedChannels[channelIndex];
      this.copyOfChannels.push(channel);
      this.selectedChannels.splice(channelIndex, 1);
    }
  }

  /**
   * Calls the function according to the intention of search. It can be:
   * 1. globalSearch:boolean -> to search for buzzwords, channels, members, information
   * 2. potentialMembersSearch:boolean -> only to search for members that can be added to a specific channel. It is used in /dialog-add-member.-channel
   *
   * @param {*} event
   */
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

  /**
   * Finds a channel by its ID from the copy of channels.
   * @param {string} id - unique identifier of the channel to find.
   * @returns {Channel | undefined} - found channel or undefined if not found.
   */
  getChannel(id: string) {
    return this.copyOfChannels.find((channel) => channel.id === id);
  }

  /**
   * Opens a channel for messaging and resets the search input.
   * @param {Channel} channel - The channel to open.
   */
  openChannel(channel: Channel) {
    this.handleInputSearchbar();
    this.navService.openChannel(channel);
  }

  /**
   * Opens a private message with a user and resets the search input.
   * @param {User} user - The user with whom to open a private message.
   */
  openPrivateMessage(user: User) {
    this.navService.openChannel(user);
    this.handleInputSearchbar();
  }

  /**
   * Opens the message in channel and the thread of selected message
   * @param {Message} message - message that is selected by user.
   */
  openChannelMessage(message: Message) {
    this.handleInputSearchbar();
    const channelID = message.channelId as string;
    const channel = this.getChannel(channelID);
    this.navService.openChannel(channel);
    this.navService.openThread(message);
  }

  /**
   * Resets the search input and toggles the searchbar empty state.
   */
  handleInputSearchbar() {
    this.inputValue = '';
    this.isSearchbarEmpty = !this.isSearchbarEmpty;
  }

  /**
   * Resets all component states, clearing selected recipients, channels, and copies of users and channels.
   */
  resetAll() {
    this.selectedRecipients = [];
    this.selectedChannels = [];

    this.users = [];
    this.channels = [];

    this.copyOfUsers = [];
    this.copyOfChannels = [];
  }

  /**
   * Lifecycle hook that performs cleanup, resetting all component states to their initial values.
   */
  ngOnDestroy() {
    this.resetAll();
  }
}
