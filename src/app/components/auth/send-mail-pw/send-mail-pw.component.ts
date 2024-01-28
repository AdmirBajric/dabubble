import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { InputComponent } from '../../shared/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LogoComponent } from '../../shared/logo/logo.component';
import { CommonModule } from '@angular/common';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-send-mail-pw',
  standalone: true,
  templateUrl: './send-mail-pw.component.html',
  styleUrl: './send-mail-pw.component.scss',
  imports: [
    FormsModule,
    InputComponent,
    MatCardModule,
    ReactiveFormsModule,
    RouterLink,
    LogoComponent,
    CommonModule,
    MatIconModule,
  ],
})
export class SendMailPwComponent {
  private auth: Auth = inject(Auth);
  email: any = '';
  emailValid: boolean = false;
  emailSend: boolean = false;

  constructor(private router: Router) {}

  onValidityChanged(field: string, isValid: boolean) {
    switch (field) {
      case 'email':
        this.emailValid = isValid;
        break;
    }
  }

  isFormValid(): any {
    return this.emailValid;
  }

  sendMail() {
    sendPasswordResetEmail(this.auth, this.email)
      .then(() => {
        this.emailSend = true;
        setTimeout(() => {
          this.router.navigate(['']);
        }, 4000);
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error);
      });
  }
}
