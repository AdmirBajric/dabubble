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
import {
  Firestore,
  collection,
  getDocs,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { FirebaseService } from '../../../services/firebase.service';
import { Subscription } from 'rxjs';
import { Conversation } from '../../../models/conversation.class';
import { MobileHeaderComponent } from "../../shared/mobile-header/mobile-header.component";

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
        MobileHeaderComponent
    ]
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
  conversationUpdateSubscription: Subscription;
  @Input() isOpen: boolean = true;
  // ********************** redirecting input event as output boolean to parent component
  showChannelContent!: boolean;
  @Output() openChannelChat = new EventEmitter<boolean>();

  showNewChat!: boolean;
  @Output() openChatWriteNewMessage = new EventEmitter<boolean>();
  @Output() channelsUpdated: EventEmitter<any[]> = new EventEmitter<any[]>();

  private unsubscribeSnapshot: (() => void) | null = null;

  constructor(
    private el: ElementRef,
    private btnService: ButtonFunctionService,
    private renderer: Renderer2,
    private firebaseService: FirebaseService,
    private channelUpdateService: chatNavigationService
  ) {
    this.checkImageFlag();
    this.setUserFromStorage();
    this.conversationUpdateSubscription = this.firebaseService
      .subscribeToConversationUpdates()
      .subscribe((update) => {
        if (update !== null) {
          const existingIndex = this.conversations.findIndex(
            (conv) => conv.id === update.id
          );
          if (existingIndex !== -1) {
            const data = update.data.users;
            this.conversations = [];
            data.forEach((user) => {
              this.conversations.push(user);
            });
            this.showUsers();
          } else {
            const data = update.data.users;
            this.conversations = [];
            data.forEach((user) => {
              this.conversations.push(user);
            });
            this.showUsers();
          }
        } else {
          // Handle deletion of conversation
        }
      });
  }

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

  ngOnDestroy() {
    this.unsubscribeFromSnapshot();
  }

  ngOnInit() {
    this.setUserFromStorage();
    setTimeout(() => {
    this.checkWindowSize();
    }, 1500);
  }

  async openDirectMsgs() {
    this.setUserFromStorage();

    this.showDMs = !this.showDMs;
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

  sendData(userId: string) {
    console.log(userId);
  }

  openChannels() {
    try {
      // Listen to changes in the channels collection
      const channelsCollection = collection(this.firestore, 'channels');
      this.unsubscribeSnapshot = onSnapshot(
        channelsCollection,
        (snapshot) => {
          // Update channels whenever there is a change in the collection
          this.channels = snapshot.docs.map((doc) => {
            const data = doc.data();
            data['id'] = doc.id;
            return data;
          });
          // Emit the updated channels data
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

  unsubscribeFromSnapshot() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null; // Reset the unsubscribe function
    }
  }

  openCreateChannel() {
    this.btnService.openCreateChannel();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  private checkWindowSize(): void {
    this.screenWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
  }

  showNewMessage() {
    this.showNewChat = true;
    this.openChatWriteNewMessage.emit(this.showNewChat);
  }

  showChannelChat() {
    this.showChannelContent = true;
    this.openChannelChat.emit(this.showChannelContent);
  }

  // ############################# for STYLES #############################
  // ######################################################################

  get defaultImagePath() {
    return `./../../assets/img/add_${this.imageFlag}.svg`;
  }

  get hoverImagePath() {
    return `./../../assets/img/add_${this.imageFlag}_hover.svg`;
  }

  checkImageFlag() {
    if (this.screenWidth <= 1100) {
      this.imageFlag = 'mobile';
    } else {
      this.imageFlag = 'desktop';
    }
  }
}
