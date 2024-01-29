import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProfileDesktopDialogComponent } from '../profile-desktop-dialog/profile-desktop-dialog.component';
import { ProfileBottomSheetComponent } from '../profile-bottom-sheet/profile-bottom-sheet.component';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { Router } from "@angular/router";

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatBottomSheetModule,
  ],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  isActiveUser: boolean = true;
  mobileView: boolean = false;
  windowWidth: number = 0;
  fullName: string = 'Guest User';
  img: string = '../../../../assets/img/avatar3.svg';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    public router: Router
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }

  openDesktopDialog() {
    this.dialog.open(ProfileDesktopDialogComponent, {
      position: { top: '7.5rem', right: '2rem' },
    });
  }

  openBottomSheet() {
    this._bottomSheet.open(ProfileBottomSheetComponent);
  }
}
