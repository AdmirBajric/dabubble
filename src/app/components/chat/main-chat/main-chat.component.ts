import { Component, Input, OnInit, OnDestroy, Output, AfterViewInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ChatHeaderComponent } from '../../shared/chat-header/chat-header.component';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageComponent } from '../../chat/message/message.component';
import { RouteService } from '../../../services/route.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { RouterLink } from '@angular/router';
import { TimeSeparatorChatComponent } from '../../shared/time-separator-chat/time-separator-chat.component';
import { Comment, Message } from '../../../models/message.class';
import { User } from '../../../models/user.class';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Subscription } from 'rxjs';
import { Channel } from 'diagnostics_channel';
import { FirebaseService } from '../../../services/firebase.service';
import { DataService } from '../../../services/data.service';
import { send } from 'process';

@Component({
    selector: 'app-main-chat',
    standalone: true,
    templateUrl: './main-chat.component.html',
    styleUrl: './main-chat.component.scss',
    imports: [ChatHeaderComponent, CommonModule, HoverChangeDirective, MessageComponent, MessageInputComponent, RouterLink, TimeSeparatorChatComponent],

})
export class MainChatComponent implements OnInit, OnDestroy {
  text: string = ''; // to be used for message text variable
  messages: Message[] = [];
  showMessages!: boolean;
  currentChannel!: Channel;
  channelId!: string;
  user!: User;
  messageId: string = '';

  private channelOpenStatusSubscription!: Subscription;
  private currentChannelSubscription!: Subscription;
  showChannel: boolean = false;

  private subscription: Subscription;
  messagesSubscription: Subscription | undefined;

  constructor(
    private routeService: RouteService,
    private navServie: chatNavigationService,
    private firebaseService: FirebaseService,
    private dataService: DataService
  ) {
    this.subscription = this.dataService.triggerFunction$.subscribe(() => {
      this.clearMainChat();
    });
  }

  clearMainChat() {
    this.messages = [];
    this.showChannel = false;
  }

  get isNotDashboard() {
    return !this.routeService.checkRoute('/dashboard');
  }

  ngOnInit(): void {
    this.subscribeToCurrentChannel();
    this.subscribeChannelStatus();
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  /**
   * Is being called when messageString is emited from message-input.component.
   * Creates a new message object to be sent.
   * @param {string} messageString
   */
  createMessage(messageString: string) {
    const isChannelMessage = this.checkIfChannel();
    const message = new Message({
      text: messageString,
      timestamp: new Date(),
      creator: this.user,
      channelId: this.channelId,
      isChannelMessage: isChannelMessage,
      reactions: [],
      comments: [],
    });
    this.sendMessage(message);
  }

  /**
   * Gets the message object and sends it to Firestore database.
   * @param {Message} message
   */
  sendMessage(message: Message) {
    this.firebaseService
      .addDocument('messages', message.toJSON())
      .then((data: any) => {
        this.messageId = data.id;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * Is being called when event is emited.
   * Saves the edited message and marks is as edited in Firestore database.
   * @async
   * @param {{messageText: string, id: string}} event - An object containing the edited text and the message id.
   * @returns {*}
   */
  async saveEditedMessage(event: { messageText: string; id: string }) {
    const docSnapshot = await this.firebaseService.getDocument(
      'messages',
      event.id
    );

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('messages', event.id, {
        text: event.messageText,
        edited: true,
      });
    }

    /**
     * Searches for messages in a specific channel by its ID. Updates the local messages array.
     * It sets 'showMessages' to true if at least one message is found.
     * @async
     * @param {string} id - ID of the channel
     * @returns {*}
     */
    async searchChannelMessages(id: string) {
        const querySnapshot = await this.firebaseService.queryDocuments(
            'messages',
            'channelId',
            '==',
            id
        )

        if (querySnapshot) {
            querySnapshot.forEach((doc: any) => {
                let messageData = doc.data();
                messageData['id'] = doc.id;
                // Check if the message is already in the local messages array to avoid duplicates.
                const messageExists = this.messages.some(message => message.id === messageData.id);
                //if the message does not exist, adds it to the loval messages array.
                if (!messageExists) {
                    this.messages.push(messageData);
                }
            });

            this.sortMessagesChronologically();
            // Set 'showMessages' to true indicating that messages are available for display.
            this.showMessages = true;
        }
    }
    
    /**
     * Sorts messages chronologically according to timestamp. 
     */
    sortMessagesChronologically() {
        this.messages.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateA.getTime() - dateB.getTime();
          });
    }

    /**
     * Subscribes to the observable of current channel from the navigation service.
     * When a new channel is emitted, it checks if the channel has changed and, if so, prepares data for the new channel.
     */
    subscribeToCurrentChannel() {
        this.currentChannelSubscription = this.navServie.currentChannel.subscribe(channel => {
            if (channel && 'id' in channel) {
                if (this.channelChanged(channel.id)) {
                    this.prepareData(channel.id, channel)
                }
            }
        })
    }

    /**
     * Prepares the data according to the given channel. It clears any axisting messages,
     * sets the current channel, and initiates a search for messages within the channel. 
     * @date 2/16/2024 - 5:01:56 PM
     *
     * @param {string} id - The ID of the channel to prepare data for.
     * @param {Channel} channel - The channel obkect containing data about the current channel.
     */
    prepareData(id: string, channel: Channel) {
        this.messages = []; // Clears existing messages to prepare for new channel messages
        this.currentChannel = channel; // Sets the current channel.
        this.channelId = id; // Stores the channel ID for message search purposes
        this.searchChannelMessages(id); // Inititates a search for messages.
    }

    /**
     * Checks if the given channel ID is different from the current channel ID,
     * indicating a channel change.
     * @param {string} id - The ID of the channel to check against the current channel ID.
     * @returns {boolean} - Return true if the given channel ID is different from the current channel ID
     */
    channelChanged(id: string) {
        return this.channelId !== id;
    }


    /**
     * Compares the day, month & year of two given messagetimestamps. 
     * It returns true, if the two messages are sent on different days, 
     * so the time-separator must be shown.
     * @param {Date} time0 - timestamp of previous message
     * @param {Date} time1 - timestamp of message
     * @returns {boolean}
    */
    isDifferentDay(time0: Date, time1: Date) {
        const previousDate = new Date(time0);
        const currentDate = new Date(time1);

        return previousDate.getDate() !== currentDate.getDate() ||
            previousDate.getMonth() !== currentDate.getMonth() ||
            previousDate.getFullYear() !== currentDate.getFullYear();
    }

  ngOnDestroy() {
    if (this.channelOpenStatusSubscription) {
      this.channelOpenStatusSubscription.unsubscribe();
    }

    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.firebaseService.unsubscribeFromMessages();
    this.subscription.unsubscribe();
  }
}
