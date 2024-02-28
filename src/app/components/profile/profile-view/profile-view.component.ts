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
import { FirebaseService } from '../../../services/firebase.service';
import { Conversation } from '../../../models/conversation.class';

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
  users: any[] = [];
  user: any = {};
  mobileView: boolean = false;
  windowWidth: number = 0;

  constructor(
    private firebaseService: FirebaseService,
    private dataService: DataService,
    public dialog: MatDialog,
    private el: ElementRef,
    private renderer: Renderer2,
    public dialogRef: MatDialogRef<ProfileViewComponent>
  ) {}

  ngOnInit(): void {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }

    this.dataService.currentUserId.subscribe((userId) => {
      if (userId) {
        this.showUserDetails(userId);
      }
    });
    this.checkWindowSize();
  }

  async showUserDetails(userId: string) {
    await this.firebaseService.getAllUsers().then((users) => {
      users.forEach((user: any) => {
        this.users.push(user);
      });
    });

    this.users.forEach((user: any) => {
      if (user.id === userId) {
        this.userImg = user.avatar;
        this.userFullName = user.fullName;
        this.userEmail = user.email;
        this.userId = user.id;
        this.ifUserAcc = this.user.id === userId ? true : false;
        this.isActiveUser = this.user.id === userId ? true : false;
      }
    });
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

  async addUserToConversations(userToAdd: string) {
    this.onNoClick();
    try {
      if (!this.user) {
        return;
      }

      let filteredUser;
      await this.firebaseService.getAllUsers().then((users) => {
        users.filter((user) => {
          if (user['id'] === userToAdd) {
            filteredUser = user;
          }
        });
      });

      await this.createConversation(this.user, userToAdd);
      await this.createConversation(filteredUser, this.user.id);
    } catch (error: any) {
      if (error.message.includes('No document to update')) {
        console.error(
          'Error: Conversation does not exist. Creating a new conversation.'
        );
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  async createConversation(user: any, userToAdd: any) {
    const conversation = await this.firebaseService.getConversationForUser(
      user.id
    );

    if (conversation) {
      if (conversation.data.creator.id === user.id) {
        if (!conversation.data.users.includes(userToAdd)) {
          conversation.data.users.push(userToAdd);

          await this.firebaseService.updateConversation(
            conversation.id,
            conversation.data
          );
          console.log('User added to conversation successfully.');
        } else {
          console.log('User is already in the conversation.');
        }
      } else {
        console.log(
          'Logged-in user is not the creator of the conversation. Cannot update.'
        );
      }
    } else {
      const newConversation = new Conversation({
        creator: user,
        users: [userToAdd],
      });

      await this.firebaseService.createConversation(newConversation);
      console.log('Conversation created successfully.');
    }
  }
}
