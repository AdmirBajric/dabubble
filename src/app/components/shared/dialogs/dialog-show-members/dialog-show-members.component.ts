import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { ButtonFunctionService } from '../../../../services/button-function.service';
import { FirebaseService } from '../../../../services/firebase.service';

// ************************************************************* interface in collection.class.ts korrekt anlegen********
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
  id: number;
}
// ############################################################### DUMMY DATA END

@Component({
  selector: 'app-dialog-show-members',
  standalone: true,
  imports: [
    CommonModule,
    HoverChangeDirective,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './dialog-show-members.component.html',
  styleUrl: './dialog-show-members.component.scss',
})
export class DialogShowMembersComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogShowMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private btnService: ButtonFunctionService,
    private firebaseNav: FirebaseService
  ) {}
  channel = this.data;

  /**
   * Initializes the component by fetching all users from Firebase and updating the online status of channel members.
   * It iterates through each user fetched and updates the `isOnline` status of the corresponding member in the `channel.members` array.
   */
  ngOnInit(): void {
    this.firebaseNav.getAllUsers().then((users) => {
      users.forEach((user) => {
        this.channel.members.forEach((member: any) => {
          if (user['id'] === member.id) {
            member.isOnline = user['isOnline'];
          }
        });
      });
    });
  }

  /**
   * Closes the currently open dialog.
   */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Triggers the profile view for a given member based on their ID.
   * @param {string} id The unique identifier of the member whose profile is to be viewed.
   */
  showMemberProfile(id: string) {
    this.btnService.openProfile(id);
    this.closeDialog();
  }

  /**
   * Closes the current dialog and opens a new dialog to add members to the channel.
   */
  openDialogAddingMember() {
    this.closeDialog();
    this.btnService.addMemberDialog(this.channel);
  }
}
