import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { InputComponent } from '../../shared/input/input.component';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogoComponent } from '../../shared/logo/logo.component';
import { User } from '../../../models/user.class';
import { DataService } from '../../../data.service';

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

  user: User = new User({});

  constructor(
    private router: Router,
    private dataService: DataService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  setHover(value: boolean): void {
    this.isHovered = value;
  }

  ngOnInit(): void {
    this.checkWindowSize();
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
      this.active = true;
    } else {
      this.active = false;
    }
  }

  navigateAndSendUser(): void {
    this.user.fullName = this.createFullName(this.user.fullName);
    this.user.email = this.user.email.toLowerCase();
    const userToSend = this.user;
    this.dataService.changeUser(userToSend);
    this.router.navigate(['/select-avatar']);
  }

  createFullName(fullName: string) {
    let firstName = fullName.split(' ')[0];
    let lastName = fullName.split(' ')[1];

    firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }

  onValidityChanged(field: string, isValid: boolean) {
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

  onCheckboxChange() {
    this.position = this.position === 0 ? 1 : 0;
  }

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
}
