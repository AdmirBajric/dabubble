import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileViewComponent } from '../components/profile/profile-view/profile-view.component';
import { ChannelEditComponent } from '../components/chat/channel/channel-edit/channel-edit.component';
import { CreateChannelComponent } from '../components/shared/dialogs/create-channel/create-channel.component';
import { DialogShowMembersComponent } from '../components/shared/dialogs/dialog-show-members/dialog-show-members.component';
import { DialogAddUserComponent } from '../components/shared/dialogs/dialog-add-user/dialog-add-user.component';
import { DialogAddMemberChannelComponent } from '../components/shared/dialogs/dialog-add-member-channel/dialog-add-member-channel.component';
// import { Room } from '../models/collection.class';

// ################################# DUMMY DATA TO TYPE MEMBER ###############
interface Member {
  fullName: string;
  avatar: string;
  email: string;
  isOnline: boolean;
}

interface Room {
  name: string;
  description: string;
  members: Member[];
}

// ################################# DUMMY DATA END ################################

@Injectable({
  providedIn: 'root'
})
export class ButtonFunctionService {

  constructor(public dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(ProfileViewComponent);
  }

  openChannelDialog() {
    this.dialog.open(ChannelEditComponent, {
      autoFocus: false,
    });
  }

  openCreateChannel() {
    this.dialog.open(CreateChannelComponent, {
      autoFocus: false,
    });
  }
  
  /**
   * Opening a dialog with a list of all channel members.
   * @param {Member[]} members
   */
  showChannelMembers(members: Member[]){
    this.dialog.open(DialogShowMembersComponent, {
      data: members
    })
  }
  
  /**
   * Opens dialog with all necessary details of member. Member can be user or contacts of user.
   * @param {Member[]} user
   */
  openProfile(user: Member[]){
    this.dialog.open(ProfileViewComponent, {
      data: user
    })
  }


  /****************************************************adding member to channel with firestore ID */
  addMember(room: Room[]){
  this.dialog.open(DialogAddMemberChannelComponent, {
    data: room
  });
  }

  // userListDialog(userList: Member[]){
  //   this.dialog.open(DialogUserListComponent, {
  //     data: userList
  //   })
  // }
}
