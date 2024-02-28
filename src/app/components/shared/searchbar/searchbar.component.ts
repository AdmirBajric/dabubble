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

  /**
   * The following 2 booleans are to regulate the functionality of searchbar.
   * @type {!boolean}
   */
  @Input() globalSearch!: boolean; //****** true if searchbar is used globally for channels, members, messages, information

  /**
   * Sends data as userList to parent component: dialog-add-member-channel to display search results in parent component.
   * @type {EventEmitter<any[]>}
   */
  @Output() userListForAddingChannel: EventEmitter<any[]> = new EventEmitter<
    any[]
  >();

  /**
   * Sends boolean to parent component: dialog-add-member-channel. If the inputfield of this component is empty,
   * the parent component should not display anything in container.
   * @type {EventEmitter<boolean>}
   */
  @Output() inputChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('searchbarInput') searchbarInput!: ElementRef<HTMLInputElement>;

  /**
   * This boolean brings the information of event (inputChange) to the parent element.
   * If true = parent element does not display results
   * if false = parent element displays results
   * @type {boolean}
   */
  isSearchbarEmpty: boolean = true;
  /* Julius*/
  searchTerm!: string;
  filteredUserArray: any[] = [];
  filteredChannelsArray: any[] = [];
  /* Julius Ende*/
  users!: User[];
  channels!: Channel[];
  copyOfChannels!: any[];
  copyOfUsers!: any[];
  usersSearch: boolean = false;
  channelSearch: boolean = false;
  selectedRecipients: User[] = [];
  selectedChannels: Channel[] = [];
  inputValue!: string;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.setUserAndChannels();
  }

  ngAfterViewInit() {
    this.searchbarInput.nativeElement.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.checkInputAndSyncArrays();
      }
    });
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

  checkInputAndSyncArrays() {
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
    console.log(this.users);
  }

  makeCloneCopy() {
    this.copyOfChannels = [...this.channels];
    this.copyOfUsers = [...this.users];
  }

  search() {}

  selectUser(userName: string) {
    this.usersSearch = false;
    const userIndex = this.copyOfUsers.findIndex(
      (user) => user.fullName === userName
    );
    if (userIndex !== -1) {
      const selectedUser = this.copyOfUsers[userIndex];
      this.selectedRecipients.push(selectedUser); // saving user in array of potential recipients
      this.copyOfUsers.splice(userIndex, 1); // removing selected user of array
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
    if(channelIndex !== -1){
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

  resetAll(){
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
