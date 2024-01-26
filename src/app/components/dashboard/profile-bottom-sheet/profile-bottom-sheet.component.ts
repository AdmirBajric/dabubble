import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';

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
    public dialog: MatDialog,
    private _bottomSheetRef: MatBottomSheetRef<ProfileBottomSheetComponent>
  ) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

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
    this._bottomSheetRef.dismiss();
  }

  logOut() {
    this.profileDialogOpen = false;
    this.logOutActive = true;
  }
}
