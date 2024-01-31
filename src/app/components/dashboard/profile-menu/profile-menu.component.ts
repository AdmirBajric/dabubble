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
          console.log('User with ID not found');
        }
      } catch (error) {
        console.error('Error retrieving user documents:', error);
      }
    });
  }

  async updateUserInDatabase(userProfileCollection: any, userDoc: any) {
    const userDocRef = doc(userProfileCollection, userDoc.id);
    await updateDoc(userDocRef, { isOnline: true });
  }

  async updateSaveToLocalStorage(userData: any) {
    this.fullName = userData['fullName'];
    this.userId = userData['id'];
    this.img = userData['avatar'];
    this.isUserOnline = true;
    userData['isOnline'] = true;

    localStorage.setItem('loggedInUser', JSON.stringify(userData));
  }

  async saveUsersToLOcalStorage(userProfileCollection: any) {
    const querySnapshot = await getDocs(userProfileCollection);
    const allUsersData: any[] = [];
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      allUsersData.push(userData);
    });
    localStorage.setItem('users', JSON.stringify(allUsersData));
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
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

  openDesktopDialog(userId: string): void {
    this.dialog.open(ProfileDesktopDialogComponent, {
      position: { top: '7.5rem', right: '2rem' },
    });
    this.sendUserId(userId);
  }

  sendUserId(userId: string): void {
    this.dataService.sendUserId(userId);
  }

  openBottomSheet() {
    this._bottomSheet.open(ProfileBottomSheetComponent);
  }
}
