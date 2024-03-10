import {
  Component,
  HostListener,
  Renderer2,
  ElementRef,
  inject,
} from '@angular/core';
import { DataService } from '../../../services/data.service';
import { LogoComponent } from '../../shared/logo/logo.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { getAuth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-select-avatar',
  standalone: true,
  imports: [
    LogoComponent,
    MatCardModule,
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss',
})
export class SelectAvatarComponent {
  user: any;
  createdUser: any;
  fullName: string = '';
  personImg = './assets/img/person.svg';
  showParagraph: boolean = true;
  windowWidth: number = 0;
  isGerman: boolean = false;
  spinnerActive: boolean = false;
  hidePersonImg: boolean = false;
  imgSelected: boolean = false;
  selectedFile: File | null = null;
  downloadURL: string | null = null;
  previewImageUrl: any;
  avatars = [
    './assets/img/avatar1.svg',
    './assets/img/avatar2.svg',
    './assets/img/avatar3.svg',
    './assets/img/avatar4.svg',
    './assets/img/avatar5.svg',
    './assets/img/avatar6.svg',
  ];

  firestore: Firestore = inject(Firestore);

  constructor(
    private dataService: DataService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router
  ) {}

  /**
   * Handles the file selection event, sets the image as selected, and reads the selected file to display a preview.
   * @param {Event} event - The event triggered by selecting a file.
   */
  onFileSelected(event: any) {
    this.imgSelected = true;
    this.selectedFile = event.target.files?.[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
        this.hidePersonImg = true;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /**
   * Uploads the selected image file to Firebase storage and updates the user's avatar URL in Firestore.
   * Falls back to a predefined avatar if no file is selected but an avatar is chosen.
   */
  async uploadImage() {
    if (this.selectedFile !== null) {
      const filename = this.user.id + '_' + this.selectedFile.name;

      const firebaseApp = getApp();
      const storage = getStorage(
        firebaseApp,
        'gs://dabubble-cee4e.appspot.com'
      );
      const storageRef = ref(storage, 'images/' + filename);

      uploadBytes(storageRef, this.selectedFile)
        .then(async (snapshot) => {
          const downloadURL = await getDownloadURL(storageRef);

          if (this.user) {
            this.user.avatar = downloadURL;
            await this.saveToFirestore();

            this.signOutUser();
          }
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    } else {
      if (this.imgSelected) {
        let avatar = this.personImg.split('../../')[1];

        if (this.user) {
          this.user.avatar = `https://gruppe-873.developerakademie.net/angular-projects/dabubble/${avatar}`;
          await this.saveToFirestore();

          this.signOutUser();
        }
      }
    }
  }

  ngOnInit(): void {
    this.checkWindowSize();
    this.dataService.currentUser.subscribe((user) => {
      this.user = user;
      this.fullName = user ? user.fullName : 'Test User';
    });

    this.dataService.newCreatedUser.subscribe((createdUser) => {
      this.user.id = createdUser.uid;
      this.createdUser = createdUser;
    });

    if (this.fullName === 'Test User') {
      this.router.navigate(['/sign-up']);
    }
  }

  /**
   * Handles window resize events to adjust UI elements based on the window size.
   * @param {Event} event - The window resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size and adjusts UI elements accordingly.
   */
  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.showParagraph = true;
      this.isGerman = false;
    } else {
      this.showParagraph = false;
      this.isGerman = true;
    }
  }

  /**
   * Sets the selected avatar image and updates the user's avatar URL accordingly.
   * @param {number} index - The index of the selected avatar in the avatars array.
   */
  imageClicked(index: number) {
    this.imgSelected = true;
    this.personImg = this.avatars[index];
    let avatar = this.personImg.split('../../')[1];

    if (this.user) {
      this.user.avatar = `https://gruppe-873.developerakademie.net/angular-projects/dabubble/${avatar}`;
    }
  }

  /**
   * Registers the user by uploading the image and saving user data to Firestore.
   */
  async registerUser() {
    if (this.user) {
      if (this.user != undefined) {
        this.spinnerActive = true;
        await this.uploadImage();
      }
    }
  }

  /**
   * Saves the user data to Firestore and navigates to the email verification page upon successful document addition.
   */
  async saveToFirestore() {
    try {
      const itemCollection = collection(this.firestore, 'users');
      const newDocRef = await addDoc(itemCollection, this.user);
      if (newDocRef.id) {
        this.router.navigate(['/verify-email']);
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  /**
   * Signs out the current user from Firebase authentication.
   */
  signOutUser() {
    const auth = getAuth();

    signOut(auth)
      .then(() => {
        // console.log('Benutzer abgemeldet');
      })
      .catch((error) => {
        console.error('Fehler beim Abmelden des Benutzers', error);
      });
  }
}
