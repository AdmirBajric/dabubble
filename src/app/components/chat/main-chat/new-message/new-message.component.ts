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

  handleNewMessage(e: { text: string; file: string }) {
    this.messageText = e.text;
    this.messageFile = e.file;
    this.getRecipientsSearchbar();
  }

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

  getChannelIDs(arrayChannels: Channel[]) {
    for (let i = 0; i < arrayChannels.length; i++) {
      const channel = arrayChannels[i];
      if (channel && 'id' in channel && channel.id !== undefined) {
        this.channelIds.push(channel.id);
      }
    }
  }

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

  showMessageSucces() {
    this.messageSuccess = true;
    setTimeout(() => {
      this.messageSuccess = false;
    }, 1000);
  }

  showText() {
    console.log(this.messageText);
  }
}
