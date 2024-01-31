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

  onNoClick(): void {
    this.dialogRef.close();
  }

  logOut() {
    this.profileDialogOpen = false;
    this.logOutActive = true;
    this.logoutService.logOutUser();
    this.onNoClick();
  }
}
