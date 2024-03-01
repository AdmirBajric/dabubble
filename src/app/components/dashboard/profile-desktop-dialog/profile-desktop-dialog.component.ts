import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { Router } from '@angular/router';
import { LogoutService } from '../../../services/logout.services';

@Component({
  selector: 'app-profile-desktop-dialog',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './profile-desktop-dialog.component.html',
  styleUrl: './profile-desktop-dialog.component.scss',
})
export class ProfileDesktopDialogComponent {
  profileDialogOpen: boolean = false;
  logOutActive: boolean = false;

  constructor(
    private logoutService: LogoutService,
    public dialogRef: MatDialogRef<ProfileDesktopDialogComponent>,
    public dialog: MatDialog,
    public router: Router
  ) {}

  /**
   * Opens a dialog to view the user profile and sets flags to manage the dialog and logout states.
   * It listens for the dialog closure and resets the flags and dismisses the bottom sheet.
   */
  openProfileDialog() {
    this.profileDialogOpen = true;
    this.logOutActive = false;

    const dialogRef = this.dialog.open(ProfileViewComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.profileDialogOpen = false;
      this.logOutActive = false;
      this.onNoClick();
    });
  }

  /**
   * Dismisses the bottom sheet. This function is typically called when a user action
   * requires closing the bottom sheet, such as after a logout or when closing a dialog.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Performs the logout operation, sets flags to manage the logout state, and dismisses the bottom sheet.
   */
  logOut() {
    this.profileDialogOpen = false;
    this.logOutActive = true;
    this.logoutService.logOutUser();
    this.onNoClick();
  }
}
