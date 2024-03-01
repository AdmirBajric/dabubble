import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [
    ChannelEditComponent,
    CommonModule,
    HoverChangeDirective,
    MatIconModule,
  ],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
})
export class ChatHeaderComponent implements OnInit, OnDestroy {
  @Input() styleHeaderForThread: boolean = false;
  @Output() closeThread: EventEmitter<any[]> = new EventEmitter<any[]>();
  currentChannel: Channel | null = null;
  currentUser: User | null = null;
  channelSubscription: Subscription | undefined;
  channelsSubscription: Subscription | undefined;
  isUserData: boolean = false;

  constructor(
    private btnService: ButtonFunctionService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private navService: chatNavigationService
  ) {}

  windowWidth!: number;
  mobileView!: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the size of window and sets mobileView (boolean).
   * True if windowsize is smaller than 1100px
   * @private
   */
  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.elementRef.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }

  /**
   * Lifecycle hook that is called.
   * Performs initial setup tasks:
   *    1. Subscribe to channel or user to display messages accordingly: subscribeChannel()
   *    2. subscribes to channels that are available for the logged in usre
   *    3. checks windowsize for setting mobileView:boolean
   */
  ngOnInit() {
    this.subscribeChannel();
    this.subscribeChannels();
    this.checkWindowSize();
  }

  /**
   * Lifecycle hook that is called before Angular destroys component.
   * Performs cleanup tasks:
   *   1. Unsubsribes from  channelSubscription
   *   2. Unsubsribes from  channelsSubscription
   * @date 3/1/2024 - 3:05:54 PM
   */
  ngOnDestroy() {
    // Unsubscribe from the events to avoid memory leaks
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.channelsSubscription) {
      this.channelsSubscription.unsubscribe();
    }
  }

  /**
   * Subscribes to the 'currentChannel' Observable to receive updates.
   * If 'avatar' is present within the provided data object it will put isUserData:boolean to true.
   * And currentUser will be updated with the given data. Which is relevant for direct-messages chat
   */
  subscribeChannel() {
    this.channelSubscription = this.navService.currentChannel.subscribe(
      (channelOrUser) => {
        this.isUserData = false;

        if (channelOrUser.avatar) {
          this.isUserData = true;
          this.currentUser = channelOrUser;
        } else {
          this.currentChannel = channelOrUser;
        }
      }
    );
  }

  /**
   * Subscribes to the `channelsUpdated$` observable from to receive updates about the list of channels.
   * When an update comes: iterates over the channels to find a channel or user that matches the `id` of the `currentChannel`.
   * If a match is found, it checks if there is an `avatar` property in the object. To check whether the matched item is a user or a channel:
   * - If an `avatar` is present, the item is treated as user data, setting `isUserData` to true and updating `currentUser` with the matched item.
   * - If there's no `avatar`, the item is considered channel data, and `currentChannel` is updated accordingly.
   * This method ensures that the component's state reflects the most recent data for the current channel or user.
   */
  subscribeChannels() {
    this.channelsSubscription = this.navService.channelsUpdated$.subscribe(
      (channels) => {
        const id = this.currentChannel?.id;
        this.isUserData = false;

        channels.forEach((channelOrUser) => {
          if (channelOrUser.id === id) {
            if (channelOrUser.avatar) {
              this.isUserData = true;
              this.currentUser = channelOrUser;
            } else {
              this.currentChannel = channelOrUser;
            }
          }
        });
      }
    );
  }

  /**
   * Returns the amount of members that are in the currentChannel.
   * Will be called and displayed in HTML
   * @readonly
   * @type {number}
   */
  get countMembersRoom(): number {
    return this.currentChannel ? this.currentChannel?.members?.length : 0;
  }

  /**
   * Calls the button Service to open the dialog for showing all members of channel.
   * @param {Channel} channel - Object with all the relevant information
   */
  showMembers(channel: Channel) {
    this.btnService.showChannelMembers(channel);
  }

  /**
   * Calls the button Service to open the dialog for adding members to channel.
   * @param {Channel} channel
   */
  addMember(channel: Channel) {
    this.btnService.addMemberDialog(channel);
  }

  /**
   * Calculates the absolute left positioning of image of members in header.
   * There should only be displayed 3 of them.
   * @param {number} i - index of member that will be displayed in chat- header
   * @returns {string} - string of css property for left. (in position:absolue)
   */
  getLeftPositioning(i: number): string {
    return `${3 * i}rem`;
  }

  /**
   * Calls the service to open the dialog for editing channel.
   */
  openEditChannel() {
    this.btnService.openChannelDialog();
  }

  /**
   * Is used if chat-header is used in thread.component.
   * Calls the function in navService to close the thread and update the observable.
   */
  exitThread() {
    this.navService.closeThread();
  }
}
