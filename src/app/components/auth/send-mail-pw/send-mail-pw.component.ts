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

  /**
   * Updates the validity state of a specified form field.
   * In this case, it only checks for the 'email' field to update its validity status.
   * @param {string} field - The name of the form field whose validity is being updated.
   * @param {boolean} isValid - The new validity state of the field.
   */
  onValidityChanged(field: string, isValid: boolean) {
    switch (field) {
      case 'email':
        this.emailValid = isValid;
        break;
    }
  }

  /**
   * Checks if the form is valid by verifying the validity of the email field.
   * @returns {boolean} The overall validity of the form, which in this case is determined by the validity of the email field.
   */
  isFormValid(): any {
    return this.emailValid;
  }

  /**
   * Sends a password reset email to the user.
   * Upon successful email dispatch, it sets a flag indicating the email was sent and navigates to the home page after a delay.
   * If there's an error in sending the email, it logs the error message.
   */
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
