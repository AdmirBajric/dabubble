import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  inject,
} from '@angular/core';
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
import { Router } from '@angular/router';
import { Auth, user, User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { DataService } from '../../../services/data.service';

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
  isUserOnline: boolean = true;
  mobileView: boolean = false;
  windowWidth: number = 0;
  fullName: string = '';
  userId: string = '';
  img: string = '../../../../assets/img/person.svg';

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  user$ = user(this.auth);
  userSubscription: Subscription;

  /**
   * Constructs the component with necessary dependencies and initializes the component state.
   * It checks the window size to adjust the view for mobile or desktop and subscribes to user data changes.
   * When a user data change is detected, it updates local storage and the database accordingly.
   */
  constructor(
    private dataService: DataService,
    private el: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    public router: Router
  ) {
    this.checkWindowSize();

    this.userSubscription = this.user$.subscribe(async (aUser: User | null) => {
      const userProfileCollection = collection(this.firestore, 'users');
      await this.saveUsersToLOcalStorage(userProfileCollection);

      try {
        const q = query(userProfileCollection, where('id', '==', aUser?.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          await this.updateSaveToLocalStorage(userData);
          await this.updateUserInDatabase(userProfileCollection, userDoc);
        } else {
        }
      } catch (error) {
        console.error('Error retrieving user documents:', error);
      }
    });
  }

  /**
   * Updates the user's online status in the database.
   * @param {CollectionReference} userProfileCollection - Firestore collection reference for users.
   * @param {DocumentSnapshot} userDoc - The document snapshot of the current user.
   */
  async updateUserInDatabase(userProfileCollection: any, userDoc: any) {
    const userDocRef = doc(userProfileCollection, userDoc.id);
    await updateDoc(userDocRef, { isOnline: true });
  }

  /**
   * Updates and saves the current user's data to local storage.
   * @param {Object} userData - The current user's data to save.
   */
  async updateSaveToLocalStorage(userData: any) {
    this.fullName = userData['fullName'];
    this.userId = userData['id'];
    this.img = userData['avatar'];
    this.isUserOnline = true;
    userData['isOnline'] = true;

    localStorage.setItem('loggedInUser', JSON.stringify(userData));
  }

  /**
   * Fetches and saves all users' data to local storage.
   *
   * @param {CollectionReference} userProfileCollection - Firestore collection reference for users.
   */
  async saveUsersToLOcalStorage(userProfileCollection: any) {
    const querySnapshot = await getDocs(userProfileCollection);
    const allUsersData: any[] = [];
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      allUsersData.push(userData);
    });
    localStorage.setItem('users', JSON.stringify(allUsersData));
  }

  /**
   * Unsubscribes from the user data subscription on component destruction to prevent memory leaks.
   */
  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  /**
   * Checks the window size on browser resize and adjusts the view for mobile or desktop.
   * @param {Event} event - The window resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size on window load and adjusts the view for mobile or desktop.
   * @param {Event} event - The window load event.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size to determine if the mobile view should be enabled based on the width threshold.
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
   * Opens a dialog for desktop view with a specific position.
   * @param {string} userId - The ID of the user for whom the profile dialog should be opened.
   */
  openDesktopDialog(userId: string): void {
    this.dialog.open(ProfileDesktopDialogComponent, {
      position: { top: '7.5rem', right: '2rem' },
    });
    this.sendUserId(userId);
  }

  /**
   * Sends the user ID to the DataService.
   * @param {string} userId - The ID of the user to send.
   */
  sendUserId(userId: string): void {
    this.dataService.sendUserId(userId);
  }

  /**
   * Opens a bottom sheet component for profiles.
   */
  openBottomSheet(userId: string): void {
    this._bottomSheet.open(ProfileBottomSheetComponent);
    this.sendUserId(userId);
  }
}
