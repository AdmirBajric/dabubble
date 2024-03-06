import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { WorkspaceHeaderComponent } from './workspace-header/workspace-header.component';
import { ChannelListItemComponent } from './channel-list-item/channel-list-item.component';
import { DirectMessageListItemComponent } from './direct-message-list-item/direct-message-list-item.component';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { EventEmitter } from '@angular/core';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from '../../../services/firebase.service';
import { Subscription } from 'rxjs';
import { MobileHeaderComponent } from '../../shared/mobile-header/mobile-header.component';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  imports: [
    ChannelListItemComponent,
    CommonModule,
    DirectMessageListItemComponent,
    RouterModule,
    WorkspaceHeaderComponent,
    HoverChangeDirective,
    MobileHeaderComponent,
  ],
})
export class WorkspaceComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  showChannels: boolean = false;
  showDMs: boolean = false;
  screenWidth: number = 0;
  imageFlag!: string;
  user: any;
  users: any[] = [];
  channels: any[] = [];
  channelId: string = '';
  usersSubscription: Subscription | undefined;
  usersSnapshotUnsubscribe: (() => void) | undefined;
  conversationsSubscription: Subscription | undefined;
  conversations: any[] = [];
  channelHeight: boolean = false;
  @Input() isOpen: boolean = true;
  // ********************** redirecting input event as output boolean to parent component
  showChannelContent!: boolean;
  @Output() openChannelChat = new EventEmitter<boolean>();
  @Output() channelsUpdated: EventEmitter<any[]> = new EventEmitter<any[]>();

  private unsubscribeSnapshot: (() => void) | null = null;

  /**
   * Constructor for the component, initializing essential services and setting up conversation updates.
   * Checks for image display flag based on the screen size
   * Sets the user from local storage
   * Subscribes to conversation updates.
   */
  constructor(
    private el: ElementRef,
    private btnService: ButtonFunctionService,
    private renderer: Renderer2,
    private firebaseService: FirebaseService,
    private channelUpdateService: chatNavigationService,
    private sharedService: DataService
  ) {
    this.checkImageFlag();
    this.setUserFromStorage();
  }

  /**
   * Sets the user from local storage to maintain session persistence.
   */
  setUserFromStorage() {
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
   *
   * Unsubscribes from snapshot listeners to prevent memory leaks upon component destruction.
   */
  ngOnDestroy() {
    this.unsubscribeFromSnapshot();
  }

  /**
   * Component initialization lifecycle hook to set the user from storage and adjust UI after a delay.
   */
  ngOnInit() {
    this.setUserFromStorage();
    setTimeout(() => {
      this.checkWindowSize();
    }, 1500);

    this.sharedService.triggerShowUsers.subscribe(() => {
      this.openDirectMsgs('');
    });
  }

  async openDirectMsgs(fromTrigger?: string) {
    this.setUserFromStorage();

    if (fromTrigger === 'workSpace') {
      this.showDMs = !this.showDMs;
    } else {
      this.showDMs = true;
    }

    await this.firebaseService
      .getConversationForUser(this.user.id)
      .then((data) => {
        if (data) {
          this.conversations = [];
          data.data.users.forEach((user) => {
            this.conversations.push(user);
          });
        }
      });
    this.showUsers();
  }

  /**
   * Shows users involved in the conversations, excluding the logged-in user.
   */
  async showUsers() {
    await this.firebaseService.getAllUsers().then((users) => {
      const loggedInUser = users.find((user) => user['id'] === this.user.id);
      this.users = [];
      if (loggedInUser) {
        loggedInUser['loggedInUser'] = true;
        this.users.push(loggedInUser);
      }
      users
        .filter(
          (user) =>
            user['id'] !== this.user.id &&
            this.conversations.some((id) => id === user['id'])
        )
        .forEach((user) => this.users.push(user));
    });
  }

  /**
   * Toggles channels view and sets up a listener for changes in channels collection.
   */
  openChannels() {
    this.channelHeight = !this.channelHeight;
    try {
      const channelsCollection = collection(this.firestore, 'channels');
      this.unsubscribeSnapshot = onSnapshot(
        channelsCollection,
        (snapshot) => {
          this.channels = snapshot.docs.map((doc) => {
            const data = doc.data();
            data['id'] = doc.id;
            return data;
          });
          this.channelUpdateService.updateChannels(this.channels);
        },
        (error) => {
          console.error('Error fetching channels:', error);
        }
      );
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
    this.showChannels = !this.showChannels;
  }

  /**
   * Unsubscribes from Firestore snapshot listener to prevent memory leaks and unnecessary data fetching.
   */
  unsubscribeFromSnapshot() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null; // Reset the unsubscribe function
    }
  }

  /**
   * Triggers the process to create a new channel using the button service.
   */
  openCreateChannel() {
    this.btnService.openCreateChannel();
  }

  /**
   * HostListener for window resize events to adjust UI elements based on the new window size.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  /**
   * HostListener for window load event to ensure UI elements are correctly set up after the window fully loads.
   * @param {Event} event - The window load event object.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  /**
   * Checks the window size to determine if the view should be adjusted for mobile or desktop.
   */
  private checkWindowSize(): void {
    this.screenWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
  }

  /**
   * Initiates the process to write a new message through the chat navigation service.
   */
  writeNewMessage() {
    this.channelUpdateService.openNewMessage();
  }

  /**
   * Toggles the channel chat view and emits an event to signal the change.
   */
  showChannelChat() {
    this.showChannelContent = true;
    this.openChannelChat.emit(this.showChannelContent);
  }

  // ############################# for STYLES #############################
  // ######################################################################

  /**
   * Gets the default image path based on the screen size (mobile or desktop).
   * @returns {string} The path to the default image.
   */
  get defaultImagePath() {
    return `./assets/img/add_${this.imageFlag}.svg`;
  }

  /**
   * Gets the hover image path based on the screen size (mobile or desktop).
   * @returns {string} The path to the hover image.
   */
  get hoverImagePath() {
    return `./assets/img/add_${this.imageFlag}_hover.svg`;
  }

  /**
   * Checks the screen width to set the image flag for mobile or desktop, affecting the displayed image.
   */
  checkImageFlag() {
    if (this.screenWidth <= 1100) {
      this.imageFlag = 'mobile';
    } else {
      this.imageFlag = 'desktop';
    }
  }
}
