import { Injectable, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileViewComponent } from '../components/profile/profile-view/profile-view.component';
import { ChannelEditComponent } from '../components/chat/channel/channel-edit/channel-edit.component';
import { CreateChannelComponent } from '../components/shared/dialogs/create-channel/create-channel.component';
import { DialogShowMembersComponent } from '../components/shared/dialogs/dialog-show-members/dialog-show-members.component';
import { DialogAddUserComponent } from '../components/shared/dialogs/dialog-add-user/dialog-add-user.component';
import { DialogAddMemberChannelComponent } from '../components/shared/dialogs/dialog-add-member-channel/dialog-add-member-channel.component';
import { Channel } from '../models/channel.class';
import { DataService } from './data.service';
// import { Room } from '../models/collection.class';

// ################################# DUMMY DATA TO TYPE MEMBER ###############
interface Member {
  fullName: string;
  avatar: string;
  email: string;
  isOnline: boolean;
}

// ################################# DUMMY DATA END ################################

@Injectable({
  providedIn: 'root',
})
export class ButtonFunctionService {
  constructor(public dialog: MatDialog, private dataService: DataService) {}

  /**
   * Opens the dialog for editing channel information
   */
  openChannelDialog() {
    this.dialog.open(ChannelEditComponent, {
      autoFocus: false,
    });
  }

  /**
   * Opens the dialog for creating a channel.
   */
  openCreateChannel() {
    this.dialog.open(CreateChannelComponent, {
      autoFocus: false,
    });
  }

  /**
   * Opening a dialog with a list of all channel members.
   * @param {channel} channel - The channel object which contains information like members, id ect.
   */
  showChannelMembers(channel: Channel) {
    this.dialog.open(DialogShowMembersComponent, {
      data: channel,
    });
  }
  /**
   *Opens profile with all necessary details of member.
   * @param {string} id
   */
  openProfile(id: string) {
    this.dataService.sendUserId(id);
    this.dialog.open(ProfileViewComponent);
  }

  /**
   * Opens dialog for adding member to channel
   * @param {Channel} channel
   */
  addMemberDialog(channel: Channel) {
    this.dialog.open(DialogAddMemberChannelComponent, {
      data: channel,
      position: { top: '7.5rem', right: '2rem' },
    });
  }
}
