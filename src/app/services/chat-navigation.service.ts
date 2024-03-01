import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from '../models/message.class';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class chatNavigationService {
  private threadOpenStatus!: boolean;
  private isThreadOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private channelOpenStatus!: boolean;
  private isChannelOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private currentChannel$ = new BehaviorSubject<any>(null);

  private currentMessage$ = new BehaviorSubject<any>(null);

  private channelsUpdatedSubject = new Subject<any[]>();
  channelsUpdated$ = this.channelsUpdatedSubject.asObservable();

  private isNewMessageOpenStatus!: boolean;
  private isNewMessageOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor() {
    this.isThreadOpen$.subscribe((value) => {
      this.threadOpenStatus = value;
    });

    this.isChannelOpen$.subscribe((value) => {
      this.channelOpenStatus = value;
    });

    this.isNewMessageOpen$.subscribe((value) => {
      this.isNewMessageOpenStatus = value;
    });
  }

  /**
   * Notifies subscribers about updates to the channel list.
   * @param {any[]} channels -An array of channel objects
   * reflecting the current state of channels available
   */
  updateChannels(channels: any[]) {
    this.channelsUpdatedSubject.next(channels);
  }

  /**
   * Opens a message thread based on the provided message
   * and sets the state to indicate that the thread is open.
   * @param {Message} message - Message object to open in the thread view. It should contain all necessary informations to be displayed properly
   */
  openThread(message: Message) {
    this.currentMessage$.next(message);
    this.isThreadOpen$.next(true);
  }

  /**
   * Sets the current channel or user as active.
   * Updates the application state to reflect that a channel or private-message with user is open.
   * @param {(Channel | User)} channel - The channel or user conversation to be opened.
   */
  openChannel(channel: Channel | User) {
    this.currentChannel$.next(channel);
    this.isChannelOpen$.next(true);
    this.isNewMessageOpen$.next(false);
    this.isThreadOpen$.next(false);
  }

  /**
   * Opens the interface to create a new message.
   * Closes the channel interface.
   */
  openNewMessage() {
    this.isChannelOpen$.next(false);
    this.isNewMessageOpen$.next(true);
  }

  /**
   * Closes the interface of thread.
   */
  closeThread() {
    this.isThreadOpen$.next(false);
  }

  /**
   * Closes the interface of new-message.component if user clicks on other channel or private message
   */
  closeNewMessage() {
    this.isNewMessageOpen$.next(false);
  }

  /**
   * Closes chat of channel.
   * Is being used in mobile view.
   */
  closeChat() {
    this.isChannelOpen$.next(false);
  }

  /**
   * Observable to be subscribed by components that need information about thread.component status.
   *
   * @readonly
   * @type {*}
   */
  get threadStatus$() {
    return this.isThreadOpen$.asObservable();
  }

  /**
   * Observable to provide current Message.
   * Is subscribed by thread to
   *    - get the choosen message
   *    - being updated if user wants to display another message
   * @readonly
   * @type {*}
   */
  get currentMessage() {
    return this.currentMessage$.asObservable();
  }

  /**
   * Observable to provide current channel.
   * Is subscribed to
   *    - get choosen channel
   *    - to edit the information of channel (chnannel-edit)
   *    - to display the information of channel (chat-header, chnannel-edit)
   *    - to generate placeholder according to channel (message-input)
   *    - to send message to channel (message-input)
   * @readonly
   * @type {*}
   */
  get currentChannel() {
    return this.currentChannel$.asObservable();
  }

  /**
   * Observable to provide status of channel (isOpen: boolean).
   * Is subscribed to
   *    - regulate UI (dashboard)
   *    - show channel (main-chat)
   * @readonly
   * @type {*}
   */
  get channelStatus$() {
    return this.isChannelOpen$.asObservable();
  }

  /**
   * Observable to provide status of new message (isOpen: boolean).
   * Is subscribed to
   *    - regulate UI (dashboard). opens the component if user wants to write new message
   * @readonly
   * @type {*}
   */
  get newMessageStatus$() {
    return this.isNewMessageOpen$.asObservable();
  }
}
