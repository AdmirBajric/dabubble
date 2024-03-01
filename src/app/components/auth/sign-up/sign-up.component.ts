import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  Renderer2,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { InputComponent } from '../../shared/input/input.component';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogoComponent } from '../../shared/logo/logo.component';
import { User } from '../../../models/user.class';
import { DataService } from '../../../services/data.service';
import { Firestore } from '@angular/fire/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '@angular/fire/auth';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    LogoComponent,
    InputComponent,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  @Output() inputChange = new EventEmitter<any>();

  images = [
    '../../assets/img/checkbox-empty.svg',
    '../../assets/img/checkbox-checked.svg',
  ];
  position: number = 0;
  fullName: any = '';
  email: any = '';
  password: any = '';
  ifSuccess: boolean = true;
  active: boolean = false;
  windowWidth: number = 0;

  nameValid: boolean = false;
  emailValid: boolean = false;
  passwordValid: boolean = false;

  isHovered = false;
  defaultColor = '';
  hoveredColor = '#eceefe';
  btnHoverColor = '#797ef3';

  emailExist: boolean = false;
  accCreated: boolean = false;

  user = new User();
  firestore: Firestore = inject(Firestore);

  constructor(
    private router: Router,
    private dataService: DataService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  /**
   * Sets the hover state of a component.
   * @param {boolean} value - The boolean value to set the hover state.
   */
  setHover(value: boolean): void {
    this.isHovered = value;
  }

  ngOnInit(): void {
    this.checkWindowSize();
  }

  /**
   * Adjusts component settings based on window size when the window is resized.
   * @param {Event} event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Adjusts component settings based on window size when the window is loaded.
   * @param {Event} event - The load event.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size and sets the `active` state of the component based on the width.
   */
  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  /**
   * Prepares user data and navigates to another view to complete the registration process.
   */
  navigateAndSendUser(): void {
    this.user.fullName = this.createFullName(this.user.fullName);
    this.user.email = this.user.email.toLowerCase();
    const { password, ...userToSend } = this.user;
    this.registerUser(userToSend);
  }

  /**
   * Formats the full name to capitalize the first letter of each name component.
   * @param {string} fullName - The full name to format.
   * @returns {string} The formatted full name.
   */
  createFullName(fullName: string) {
    let firstName = fullName.split(' ')[0];
    let lastName = fullName.split(' ')[1];

    firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }

  /**
   * Updates validity states for form fields based on field type and validity status.
   * @param {string} field - The field to check validity for.
   * @param {boolean} isValid - Whether the field is valid or not.
   */
  onValidityChanged(field: string, isValid: boolean) {
    this.emailExist = false;
    switch (field) {
      case 'name':
        this.nameValid = isValid;
        break;
      case 'email':
        this.emailValid = isValid;
        break;
      case 'password':
        this.passwordValid = isValid;
        break;
    }
  }

  /**
   * Toggles the position state between 0 and 1.
   */
  onCheckboxChange() {
    this.position = this.position === 0 ? 1 : 0;
  }

  /**
   * Evaluates the overall form validity based on individual field validity and additional conditions.
   * @returns {boolean} The form's overall validity state.
   */
  isFormValid(): any {
    if (this.windowWidth < 1100) {
      return this.nameValid && this.emailValid && this.passwordValid;
    }
    return (
      this.nameValid &&
      this.emailValid &&
      this.passwordValid &&
      this.position === 1
    );
  }

  /**
   * Registers a new user using Firebase authentication and handles the post-registration process.
   * @param {Object} userToSend - The user data to send excluding the password.
   */
  registerUser(userToSend: any) {
    if (this.user && this.user.email && this.user.password) {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, this.user.email, this.user.password)
        .then((data) => {
          sendEmailVerification(data.user);
          this.dataService.changeUser(userToSend);
          this.dataService.setCreatedUser(data.user);
          this.accCreated = true;

          setTimeout(() => {
            this.router.navigate(['/select-avatar']);
          }, 4000);
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            this.emailExist = true;
          }
        });
    }
  }
}
