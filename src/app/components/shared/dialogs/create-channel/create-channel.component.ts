import { Component, ElementRef } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DialogInputComponent } from '../dialog-input/dialog-input.component';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../../../models/user.class';

@Component({
    selector: 'app-create-channel',
    standalone: true,
    templateUrl: './create-channel.component.html',
    styleUrl: './create-channel.component.scss',
    imports: [MatDialogModule, MatCardModule, MatIconModule, DialogInputComponent]
})
export class CreateChannelComponent {

  ChannelName :string = "z.B Kooperationsprojekte";
  Description :string = "Dein Text hier";
  user! :User[];

  constructor(
    public dialog: MatDialog,
    private elementRef: ElementRef,
    public dialogRef: MatDialogRef<CreateChannelComponent>,
  ) {}
  

  onNoClick() {
    this.dialogRef.close();
  }

  createChannel() {
    this.dialogRef.close();
    this.dialog.open(DialogAddUserComponent, {
      autoFocus: false,
    });
  }
}
