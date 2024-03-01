import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { Router } from '@angular/router';
import { LogoutService } from '../../../services/logout.services';

@Component({
  selector: 'app-profile-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './profile-bottom-sheet.component.html',
  styleUrl: './profile-bottom-sheet.component.scss',
})
export class ProfileBottomSheetComponent {
  profileDialogOpen: boolean = false;
  logOutActive: boolean = false;
  constructor(
    private logoutService: LogoutService,
    public dialog: MatDialog,
    private _bottomSheetRef: MatBottomSheetRef<ProfileBottomSheetComponent>,
    public router: Router
  ) {}

  /**
   * Prevents the default action for a mouse event and dismisses the bottom sheet.
   * This function is typically used to intercept click events on links and handle them differently.
   * @param {MouseEvent} event - mouse event triggered by clicking a link.
   */
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

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
    this._bottomSheetRef.dismiss();
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
