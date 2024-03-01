import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { MessageInputComponent } from '../../../shared/message-input/message-input.component';
import { InputComponent } from '../../../shared/input/input.component';
import { SearchbarComponent } from '../../../shared/searchbar/searchbar.component';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { Message } from '../../../../models/message.class';
import { FirebaseService } from '../../../../services/firebase.service';
@Component({
  selector: 'app-new-message',
  standalone: true,
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
  imports: [
    CommonModule,
    MessageInputComponent,
    InputComponent,
    SearchbarComponent,
  ],
})
export class NewMessageComponent implements OnInit {
  @ViewChild('searchBarRef') searchBar!: SearchbarComponent;
  @Output() inputPlaceholder: string = 'An: #channel oder @jemand';
  user!: User;
  messageText!: string;
  messageFile!: string;
  channelIds: string[] = [];
  messageSuccess: boolean = false;
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Lifecycle hook that initializes the component.
   * Retrieve and parse the 'loggedInUser' from localStorage
   * Sets the parsed user object to the component's state.
   */
  ngOnInit() {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }
  }

  /**
   * Handles the event when child (message-input) ist emitting message text and fil.
   * Initiating the process to get the recipients from the search bar.
   * @param {Object} e - The event object containing the message text and attached file.
   * @param {string} e.text - The text of the message.
   * @param {string} e.file - The file attached to the message, if any.
   */
  handleNewMessage(e: { text: string; file: string }) {
    this.messageText = e.text;
    this.messageFile = e.file;
    this.getRecipientsSearchbar();
  }

  /**
   * Retrieves the selected channel and user recipients from the search bar and prepares messages for sending.
   */
  getRecipientsSearchbar() {
    const channelRecipients = this.searchBar.selectedChannels;
    const userRecipients = this.searchBar.selectedRecipients;
    console.log(channelRecipients);
    console.log(userRecipients);

    if (channelRecipients.length > 0) {
      this.getChannelIDs(channelRecipients);
      this.prepareChannelMessages();
    }
    if (userRecipients.length > 0) {
      this.prepareDirectMessages(userRecipients);
    }
  }

  /**
   * Extracts and stores the IDs of the selected channels.
   * @param {Channel[]} arrayChannels - An array of selected channel objects.
   */
  getChannelIDs(arrayChannels: Channel[]) {
    for (let i = 0; i < arrayChannels.length; i++) {
      const channel = arrayChannels[i];
      if (channel && 'id' in channel && channel.id !== undefined) {
        this.channelIds.push(channel.id);
      }
    }
  }

  /**
   * Prepares and sends messages for each selected channel.
   */
  prepareChannelMessages() {
    for (let i = 0; i < this.channelIds.length; i++) {
      const id = this.channelIds[i];
      const message = new Message({
        text: this.messageText,
        timestamp: new Date(),
        creator: this.user,
        channelId: id,
        isChannelMessage: true,
        reactions: [],
        myMsg: false,
        file: this.messageFile,
      });
      const messageJSON = message.toJSON();
      this.sendMessage(messageJSON);
    }
  }

  /**
   * Prepares and sends direct messages to each selected user.
   * @param {User[]} selectedUsers - An array of selected user objects.
   */
  prepareDirectMessages(selectedUsers: User[]) {
    for (let i = 0; i < selectedUsers.length; i++) {
      const recipient = selectedUsers[i];
      const message = new Message({
        text: this.messageText,
        timestamp: new Date(),
        creator: this.user,
        recipient: recipient,
        reactions: [],
        privateMsg: true,
        myMsg: false,
        file: this.messageFile,
      });
      const messageJSON = message.toJSON();
      this.sendMessage(messageJSON);
    }
  }

  /**
   * Sends a message to the database and resets the search bar upon successful sending.
   * @param {Object} messageToJson - The message object to be sent, formatted as JSON.
   */
  sendMessage(messageToJson: Message) {
    this.firebaseService
      .addDocument('messages', messageToJson)
      .then((data: any) => {
        this.showMessageSucces();
        this.searchBar.resetAll();
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * Displays a success indicator briefly after a message is successfully sent.
   */
  showMessageSucces() {
    this.messageSuccess = true;
    setTimeout(() => {
      this.messageSuccess = false;
    }, 1000);
  }

  /**
   * Logs the current message text to the console. Primarily for debugging purposes.
   */
  showText() {
    console.log(this.messageText);
  }
}
