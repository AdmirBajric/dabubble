import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileViewComponent } from '../components/shared/dialogs/profile-view/profile-view.component';
import { ChannelEditComponent } from '../components/chat/channel/channel-edit/channel-edit.component';
import { CreateChannelComponent } from '../components/shared/dialogs/create-channel/create-channel.component';

@Injectable({
  providedIn: 'root',
})
export class ButtonFunctionService {
  constructor(public dialog: MatDialog) {}

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
}
