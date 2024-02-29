import {
  Component,
  AfterViewInit,
  EventEmitter,
  Input,
  Output,
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

  ngAfterViewInit() {
    this.searchbarInput.nativeElement.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.checkInputAndSyncArraysUsersAndChannels();
      }
    });
  }

  showUserProfile(id: string) {
    this.btnService.openProfile(id);
  }

  async getData() {
    if (this.newMessageSearch) {
      await this.setUserAndChannels();
      this.makeCloneCopy('U&C');
    } else if (this.globalSearch) {
      await this.setUserAndChannels();
      await this.setMessages();
    }
  }

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

  getMessageIDs(data: any) {
    return data.map((message: any) => {
      return message.id;
    });
  }

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

  sortbackEndMessages() {
    this.backendMessages.forEach(async (message) => {
      await this.categorizeMessage(message);
    });
    this.makeCloneCopy('DM&CM');
  }

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

  getPersonalMessages(message: Message): Message | null {
    const loggedName = this.loggedUser.fullName;
    if (
      message.creator?.fullName === loggedName ||
      message.recipient?.fullName === loggedName
    ) {
      return message;
    } else {
      return null; // Gib null zurück, wenn die Bedingungen nicht erfüllt sind
    }
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
    this.makeCloneCopy('U&C');
  }

  checkInputAndSyncArraysUsersAndChannels() {
    const inputValue = this.searchbarInput.nativeElement.value;
    const mentionedUsersChannels = this.getMentions(inputValue);
    this.syncArrays(mentionedUsersChannels);
  }

  getMentions(inputValue: string) {
    return inputValue.split(/[@#]/);
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
  }

  // 'U&C' = users and channels
  // 'DM&CM' = directMessages and channelMessages
  makeCloneCopy(typeOfCopy: string) {
    if (typeOfCopy === 'U&C') {
      this.copyOfChannels = [...this.channels];
      this.copyOfUsers = [...this.users];
    } else if (typeOfCopy === 'DM&CM') {
      this.copyOfChannelMessages = [...this.channelMessages];
      this.copyOfPrivateMessages = [...this.privateMessages];
    }
  }

  search() {
    if (this.globalSearch) {
      const inputValue = this.searchbarInput.nativeElement.value;
      this.isSearchbarEmpty = inputValue.length === 0;
      this.checkInputAndSyncArraysMessages(inputValue);
    }
  }

  checkInputAndSyncArraysMessages(input: string) {
    const lowerCaseInput = input.toLowerCase();
    const userName = this.loggedUser.fullName.toLowerCase();
    console.log(userName);
    
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

  getChannel(id: string) {
    return this.copyOfChannels.find((channel) => channel.id === id);
  }

  openChannel(channel: Channel) {
    this.handleInputSearchbar();
    this.navService.openChannel(channel);
  }

  openPrivateMessage(user: User) {
    this.navService.openChannel(user);
    this.handleInputSearchbar();
  }

  openChannelMessage(message: Message) {
    this.handleInputSearchbar();
    const channelID = message.channelId as string;
    const channel = this.getChannel(channelID);
    this.navService.openChannel(channel);
    this.navService.openThread(message);
  }

  handleInputSearchbar() {
    this.inputValue = '';
    this.isSearchbarEmpty = !this.isSearchbarEmpty;
  }

  resetAll() {
    this.selectedRecipients = [];
    this.selectedChannels = [];

    this.users = [];
    this.channels = [];

    this.copyOfUsers = [];
    this.copyOfChannels = [];
  }

  ngOnDestroy() {
    this.resetAll();
  }
}
