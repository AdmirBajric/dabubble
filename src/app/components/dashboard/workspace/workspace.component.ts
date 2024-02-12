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
import { Firestore } from '@angular/fire/firestore';
import { FirebaseService } from '../../../services/firebase.service';

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
  @Input() isOpen: boolean = true;
  // ********************** redirecting input event as output boolean to parent component
  showChannelContent!: boolean;
  @Output() openChannelChat = new EventEmitter<boolean>();

  showNewChat!: boolean;
  @Output() openChatWriteNewMessage = new EventEmitter<boolean>();

  constructor(
    private el: ElementRef,
    private btnService: ButtonFunctionService,
    private renderer: Renderer2,
    private firebaseService: FirebaseService
  ) {
    this.checkWindowSize();
    this.checkImageFlag();
  }

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

  async openDirectMsgs(): Promise<any[]> {
    this.showDMs = !this.showDMs;

    try {
      const creatorQuery = {
        field: 'creator.id',
        operator: '==',
        value: this.user.id,
      };

      const recipientQuery = {
        field: 'recipient.id',
        operator: '==',
        value: this.user.id,
      };

      const creatorSnapshot = await this.firebaseService.queryDocuments(
        'messages',
        creatorQuery.field,
        creatorQuery.operator,
        creatorQuery.value
      );
      const recipientSnapshot = await this.firebaseService.queryDocuments(
        'messages',
        recipientQuery.field,
        recipientQuery.operator,
        recipientQuery.value
      );

      const uniqueUsers = new Set<string>();

      creatorSnapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId = data['recipient'].id;
        if (otherUserId !== this.user.id && !uniqueUsers.has(otherUserId)) {
          this.users.push(data['recipient']);
          uniqueUsers.add(otherUserId);
        }
      });

      recipientSnapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId = data['creator'].id;
        if (otherUserId !== this.user.id && !uniqueUsers.has(otherUserId)) {
          this.users.push(data['creator']);
          uniqueUsers.add(otherUserId);
        }
      });

      return this.users;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  sendData(userId: string) {
    console.log(userId);
  }

  openChannels() {
    try {
      this.firebaseService
        .getAllChannels()
        .then((channels) => {
          this.channels = channels;
        })
        .catch((error) => {
          console.error('Error fetching channels:', error);
        });
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
    this.showChannels = !this.showChannels;
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
