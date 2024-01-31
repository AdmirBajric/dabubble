import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatIconModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss',
})
export class ProfileViewComponent implements OnInit {
  isActiveUser: boolean = true;
  ifUserAcc: boolean = true;
  userImg: string = '../../assets/img/person.svg';
  userFullName: string = '';
  userEmail: string = '';
  userId: string = '';
  mobileView: boolean = false;
  windowWidth: number = 0;
  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    private el: ElementRef,
    private renderer: Renderer2,
    public dialogRef: MatDialogRef<ProfileViewComponent>
  ) {}

  ngOnInit(): void {
    this.dataService.currentUserId.subscribe((userId) => {
      if (userId) {
        this.showUserDetails(userId);
      }
    });
    this.checkWindowSize();
  }

  showUserDetails(userId: string) {
    const allUsers = localStorage.getItem('users');
    if (allUsers) {
      const users = JSON.parse(allUsers);
      users.forEach((user: any) => {
        if (user.id === userId) {
          this.userImg = user.avatar;
          this.userFullName = user.fullName;
          this.userEmail = user.email;
          this.userId = user.id;
          this.ifUserAcc = true;
        }
      });
    }
  }

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

  onNoClick() {
    this.dialogRef.close();
  }

  editAccount(userId: string) {
    this.onNoClick();
    this.dialog.open(ProfileEditComponent);
    this.sendUserId(userId);
  }

  sendUserId(userId: string): void {
    this.dataService.sendUserId(userId);
  }
}
