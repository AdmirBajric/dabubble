import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DialogInputComponent } from '../dialog-input/dialog-input.component';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { DataService } from '../../../../services/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../services/firebase.service';
import e from 'express';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss',
  imports: [
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    DialogInputComponent,
    FormsModule,
    CommonModule,
  ],
})
export class CreateChannelComponent {
  channelName: string = '';
  description: string = '';
  placeholderName: string = 'z.B Kooperationsprojekte';
  placeholderDescription: string = 'Dein Text hier';
  inputCheck: boolean = false;
  channelExist: boolean = false;

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateChannelComponent>,
    private firebaseNav: FirebaseService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  checkInput() {
    if (this.channelName.length === 0) {
      this.inputCheck = true;
    } else {
      this.inputCheck = false;
    }
  }

  onInputChange(value: string) {
    this.channelExist = false;
    if (value.length === 0) {
      this.inputCheck = true;
    } else {
      this.inputCheck = false;
    }
  }

  isFormValid(): boolean {
    return /^[A-Za-z0-9_\s]+$/.test(this.channelName);
  }

  /**
   * Formats and sends channel info to data service. In data service it updates the observable for subscribers (in this case: dialog-add-user.)
   */
  sendChannelInformation(): void {
    const channelName = `${this.channelName[0].toUpperCase()}${this.channelName
      .slice(1)
      .toLowerCase()}`;
    let description;
    if (this.description.length > 0) {
      description = `${this.description[0].toUpperCase()}${this.description
        .slice(1)
        .toLowerCase()}`;
    } else {
      description = '';
    }

    this.dataService.sendChannelInfo(channelName, description);
  }

  /**
   * Closes the dialog and calls `sendChannelInformation()` - to update the Observable
   * Opens dialog for adding user to channel.
   */
  async createChannel() {
    const result = await this.firebaseNav.doesNameExistInChannels(
      this.channelName
    );

    if (result) {
      this.channelExist = true;
    } else {
      this.channelExist = false;
      this.dialogRef.close();
      this.sendChannelInformation();
      this.dialog.open(DialogAddUserComponent, {
        autoFocus: false,
      });
    }
  }
}
