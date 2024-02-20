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

  constructor(private router: Router, renderer: Renderer2, el: ElementRef) {
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
  }
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
  @ViewChild('animationContainer') animationContainer!: ElementRef;

  private auth: Auth = inject(Auth);

  ngOnInit(): void {
    this.logoBig = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

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
        console.log(errorCode);
      });
  }

  signInWithGoogle() {
    this.errorMessage = false;
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((user) => {
        this.showSuccessAnimation('/dashboard');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  showSuccessAnimation(path: any) {
    this.loginSuccess = true;
    setTimeout(() => {
      this.router.navigate([path]);
    }, 2000);
  }
}
