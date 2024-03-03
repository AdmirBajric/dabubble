import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  HostListener,
  Renderer2,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { InputComponent } from '../../shared/input/input.component';
import { LogoComponent } from '../../shared/logo/logo.component';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    InputComponent,
    LogoComponent,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  renderer: any = Renderer2;
  el: any = ElementRef;
  showDesktop: boolean = false;
  showMobile: boolean = false;
  windowWidth: number = 0;
  logoBig: boolean = false;
  desktopAnimation: boolean = false;
  mobileAnimation: boolean = false;
  userEmail: string = '';
  userPassword: string = '';
  show: boolean = false;
  loginSuccess: boolean = false;
  errorMessage: boolean = false;
  user: User = new User();
  @ViewChild('animationContainer') animationContainer!: ElementRef;

  private auth: Auth = inject(Auth);

  constructor(
    private router: Router,
    renderer: Renderer2,
    el: ElementRef,
    private dataService: DataService
  ) {
    this.renderer = renderer;
    this.el = el;

    let screenWidth;

    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth;
    }

    if (screenWidth! <= 1100) {
      this.show = false;
      this.mobileAnimation = true;
      this.showDesktop = false;
      this.showMobile = true;
      this.logoBig = false;
    } else {
      this.show = true;
      this.desktopAnimation = true;
      this.showDesktop = true;
      this.showMobile = false;
    }

    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  ngOnInit(): void {
    this.logoBig = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window's width and updates component state based on the width.
   * Adjusts visibility of certain elements for mobile or desktop view and changes the logo size.
   */
  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.show = false;
      this.showDesktop = false;
      this.showMobile = true;
      this.logoBig = false;
    } else {
      this.show = true;
      this.showDesktop = true;
      this.showMobile = false;
    }
  }

  /**
   * Attempts to sign in a user with email and password authentication.
   * On success, redirects to the dashboard and shows a success animation.
   * On failure, displays an error message.
   */
  signIn() {
    if (this.userEmail.length > 5 && this.userPassword.length > 5) {
      signInWithEmailAndPassword(this.auth, this.userEmail, this.userPassword)
        .then((userCredential) => {
          this.errorMessage = false;
          const user = userCredential.user;
          this.showSuccessAnimation('/dashboard');
        })
        .catch((error) => {
          this.errorMessage = true;
        });
    }
  }

  /**
   * Logs in a guest user with predefined credentials.
   * On success, redirects to the dashboard and shows a success animation.
   * On failure, logs the error code.
   */
  guestLogIn() {
    this.errorMessage = false;
    const email = 'guestuser@gmail.com';
    const password = '1234567890';
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.showSuccessAnimation('/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
      });
  }

  /**
   * Initiates a sign in process using Google authentication.
   * On success, redirects to the dashboard and shows a success animation.
   * On failure, logs the error.
   */
  signInWithGoogle() {
    this.errorMessage = false;
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((userCredential) => {
        const user = userCredential.user;
        this.showSuccessAnimation('/dashboard');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Displays a success animation and redirects to a specified path.
   * @param {string} path - The path to navigate to after showing the success animation.
   */
  showSuccessAnimation(path: any) {
    this.loginSuccess = true;
    this.router.navigate([path]);
  }
}
