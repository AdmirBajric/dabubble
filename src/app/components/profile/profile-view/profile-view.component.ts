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
import { chatNavigationService } from '../../../services/chat-navigation.service';

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
    public dialogRef: MatDialogRef<ProfileViewComponent>,
    private navService: chatNavigationService,
    private sharedService: DataService
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

  /**
   * Retrieves and displays user details from Firebase based on the provided user ID.
   * @async
   * @param {string} userId - unique identifier for the user.
   * @returns {*}
   */
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

  /**
   * HostListener for window resize event to adjust views accordingly.
   * @param {Event} event - resize event object
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * HostListener for window load event to check the window size on load.
   * @param {Event} event - load event object.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size to toggle mobile view.
   */
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

  /**
   * Closes the currently open dialog.
   */
  onNoClick() {
    this.dialogRef.close();
  }

  /**
   * Initiates editing the account by opening the profile edit component.
   * @param {string} userId - unique identifier for the useraccount
   */
  editAccount(userId: string) {
    this.onNoClick();
    this.dialog.open(ProfileEditComponent);
    this.sendUserId(userId);
  }

  /**
   * Sends the user ID to another component via a shared data service.
   * @param {string} userId - unique identifier for the user.
   */
  sendUserId(userId: string): void {
    this.dataService.sendUserId(userId);
  }

  /**
   * Adds a user to conversations, creating new conversations if necessary.
   * @param {string} userToAdd - The ID of the user to add to the conversation.
   */
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

  /**
   * Creates or updates a conversation for the given user with another user.
   * @param {any} user - user object initiating the conversation.
   * @param {any} userToAdd -  ID of the user to be added to the conversation.
   */
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
          this.sharedService.triggerShowUsers.emit();
          this.navService.openChannel(user);
        } else {
          this.navService.openChannel(user);
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
      this.navService.openChannel(user);
      this.sharedService.triggerShowUsers.emit();
    }
  }
}
