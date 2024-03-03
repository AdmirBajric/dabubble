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
  creatorAvatar: string = '';
  channelId: string = '';
  channelMembers: any[] = [];

  @ViewChild('channelNameInput') channelNameInput!: ElementRef;
  @ViewChild('channelDescriptionInput') channelDescriptionInput!: ElementRef;

  currentChannel!: Channel;

  constructor(
    private elementRef: ElementRef,
    public dialogRef: MatDialogRef<ChannelEditComponent>,
    private renderer: Renderer2,
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

  /**
   * Loads the logged-in user's data from local storage, if available.
   */
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

  /**
   * Subscribes to the current channel updates from the navigation service.
   */
  async subscribeChannel() {
    this.navService.currentChannel.subscribe((channel) => {
      this.channelId = channel.id;
    });
  }

  /**
   * Fetches all channels from the Firebase service and sets current channel details.
   */
  async channels() {
    const channels = await this.firebaseService.getAllChannels();
    channels.forEach((channel) => {
      if (channel['id'] === this.channelId) {
        this.channelNameCopy = channel['name'];
        this.channelName = channel['name'];
        this.createdBy = channel['creator'].fullName;
        this.creatorAvatar = channel['creator'].avatar;
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

  /**
   * Handles window resize events to adjust view settings.
   * @param {Event} event - The window resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size to determine if the mobile view should be enabled.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size to determine if the mobile view should be enabled.
   */
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

  /**
   * Deletes the specified channel by its ID.
   * @param {string} id - The ID of the channel to delete.
   */
  channelDelete(id: string) {
    this.firebaseService
      .deleteChannel(id)
      .then(() => {
        this.dataService.triggerFunction();
        this.onNoClick();
      })
      .catch((error) => {
        console.error('Error deleting channel:', error);
      });
  }

  /**
   * Removes the logged in user from the specified channel by ID.
   * @param {string} id - ID of the channel to leave.
   */
  leaveChannel(id: string) {
    this.firebaseService
      .removeMemberFromChannel(id, this.user.id)
      .then(() => {
        this.onNoClick();
      })
      .catch((error) => {
        console.error('Error deleting member:', error);
      });
  }

  /**
   * Toggles the edit state for the channel name
   * Focuses the input field.
   */
  editName() {
    this.channelNameToggle = !this.channelNameToggle;
    this.channelNameOnFocus = true;

    if (!this.channelNameToggle) {
      setTimeout(() => {
        this.channelNameInput.nativeElement.focus();
      });
    }
  }

  /**
   * Saves the edited channel name to the database.
   * @param {string} id - The ID of the channel being updated.
   */
  saveName(id: string) {
    this.channelNameOnFocus = false;
    this.channelNameToggle = !this.channelNameToggle;
    this.channelNameCopy = this.channelName;

    this.firebaseService.updateDocument('channels', id, {
      name: this.channelName,
    });
  }

  /**
   * Toggles the edit state for the channel description and focuses the input field.
   */
  editDescription() {
    this.channelDescriptionToggle = !this.channelDescriptionToggle;
    this.channelDescriptionOnFocus = true;

    if (!this.channelDescriptionToggle) {
      setTimeout(() => {
        this.channelDescriptionInput.nativeElement.focus();
      });
    }
  }

  /**
   * Saves the edited channel description to the database.
   * @param {string} id - The ID of the channel being updated.
   */
  saveDescription(id: string) {
    this.channelDescriptionOnFocus = false;
    this.channelDescriptionToggle = !this.channelDescriptionToggle;
    this.firebaseService.updateDocument('channels', id, {
      description: this.channelDescription,
    });
  }

  /**
   * Closes the dialog.
   */
  onNoClick() {
    this.dialogRef.close();
  }
}
