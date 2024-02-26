import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../../shared/input/input.component';
import { FormsModule } from '@angular/forms';
import { ButtonFunctionService } from '../../../../services/button-function.service';
import { chatNavigationService } from '../../../../services/chat-navigation.service';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService } from '../../../../services/firebase.service';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-channel-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    InputComponent,
  ],
  templateUrl: './channel-edit.component.html',
  styleUrl: './channel-edit.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChannelEditComponent {
  user: any = {};
  users: any[] = [];
  ifMobileView: boolean = true;
  windowWidth: number = 0;
  ifUserCreateChannel: boolean = false;
  ifUserMemberChannel: boolean = false;
  channelName: string = '';
  channel: any;
  channelNameCopy: string = '';
  channelNameToggle: boolean = true;
  channelDescriptionToggle: boolean = true;
  channelNameOnFocus: boolean = false;
  channelDescriptionOnFocus: boolean = false;
  createdBy: string = '';
  channelDescription: string = '';
  channelId: string = '';
  channelMembers: any[] = [];

  @ViewChild('channelNameInput') channelNameInput!: ElementRef;
  @ViewChild('channelDescriptionInput') channelDescriptionInput!: ElementRef;

  currentChannel!: Channel;

  constructor(
    private elementRef: ElementRef,
    public dialogRef: MatDialogRef<ChannelEditComponent>,
    private renderer: Renderer2,
    private btnService: ButtonFunctionService,
    private navService: chatNavigationService,
    private firebaseService: FirebaseService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    this.checkWindowSize();
    await this.loadUserFromStorage();
    await this.subscribeChannel();
    await this.channels();
  }

  async loadUserFromStorage() {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }
  }

  async subscribeChannel() {
    this.navService.currentChannel.subscribe((channel) => {
      this.channelId = channel.id;
    });
  }

  async channels() {
    const channels = await this.firebaseService.getAllChannels();
    channels.forEach((channel) => {
      if (channel['id'] === this.channelId) {
        this.channelNameCopy = channel['name'];
        this.channelName = channel['name'];
        this.createdBy = channel['creator'].fullName;
        this.channelDescription = channel['description'];

        channel['members'].forEach((member: any) => {
          this.channelMembers.push(member);
        });

        if (channel['creator'].id === this.user.id) {
          this.ifUserCreateChannel = true;
        }

        this.channelMembers.forEach((member) => {
          if (member.id === this.user.id) {
            this.ifUserMemberChannel = true;
          }
        });
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.elementRef.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.ifMobileView = true;
    } else {
      this.ifMobileView = false;
    }
  }

  channelDelete(id: string) {
    this.firebaseService
      .deleteChannel(id)
      .then(() => {
        console.log('Channel deleted');
        this.dataService.triggerFunction();
        this.onNoClick();
      })
      .catch((error) => {
        console.error('Error deleting channel:', error);
      });
  }

  leaveChannel(id: string) {
    console.log(id, this.user.id);

    this.firebaseService
      .removeMemberFromChannel(id, this.user.id)
      .then(() => {
        console.log('Memeber removed from channel');
        this.onNoClick();
      })
      .catch((error) => {
        console.error('Error deleting member:', error);
      });
  }

  editName() {
    this.channelNameToggle = !this.channelNameToggle;
    this.channelNameOnFocus = true;

    if (!this.channelNameToggle) {
      setTimeout(() => {
        this.channelNameInput.nativeElement.focus();
      });
    }
  }

  saveName(id: string) {
    this.channelNameOnFocus = false;
    this.channelNameToggle = !this.channelNameToggle;
    this.channelNameCopy = this.channelName;

    this.firebaseService.updateDocument('channels', id, {
      name: this.channelName,
    });
  }

  editDescription() {
    this.channelDescriptionToggle = !this.channelDescriptionToggle;
    this.channelDescriptionOnFocus = true;

    if (!this.channelDescriptionToggle) {
      setTimeout(() => {
        this.channelDescriptionInput.nativeElement.focus();
      });
    }
  }

  saveDescription(id: string) {
    this.channelDescriptionOnFocus = false;
    this.channelDescriptionToggle = !this.channelDescriptionToggle;
    this.firebaseService.updateDocument('channels', id, {
      description: this.channelDescription,
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
