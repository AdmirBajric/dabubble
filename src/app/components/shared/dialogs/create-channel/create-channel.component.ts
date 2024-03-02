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

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateChannelComponent>
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  /**
   * Formats and sends channel info to data service. In data service it updates the observable for subscribers (in this case: dialog-add-user.)
   */
  sendChannelInformation(): void {
    const channelName = `${this.channelName[0].toUpperCase()}${this.channelName
      .slice(1)
      .toLowerCase()}`;
    const description = `${this.description[0].toUpperCase()}${this.description
      .slice(1)
      .toLowerCase()}`;
    this.dataService.sendChannelInfo(channelName, description);
  }

  /**
   * Closes the dialog and calls `sendChannelInformation()` - to update the Observable
   * Opens dialog for adding user to channel.
   */
  createChannel() {
    this.dialogRef.close();
    this.sendChannelInformation();
    this.dialog.open(DialogAddUserComponent, {
      autoFocus: false,
    });
  }
}
