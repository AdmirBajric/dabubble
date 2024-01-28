import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InputComponent } from '../../shared/input/input.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from '../../shared/logo/logo.component';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth, confirmPasswordReset } from '@angular/fire/auth';

@Component({
  selector: 'app-reset-pw',
  standalone: true,
  templateUrl: './reset-pw.component.html',
  styleUrl: './reset-pw.component.scss',
  imports: [
    CommonModule,
    InputComponent,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    LogoComponent,
    FormsModule,
  ],
})
export class ResetPwComponent {
  private auth: Auth = inject(Auth);
  password: string = '';
  confirmPassword: string = '';
  newPassword: string = '';
  passwordValid: boolean = false;
  passwordsNotMatch: boolean = false;
  oobCode: string = '';
  pwReset: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe((params) => {
      this.oobCode = params['oobCode'];

      if (!params['oobCode']) {
        this.router.navigate(['/']);
      }
    });
  }

  ifPasswordsMatch() {
    return this.password != this.confirmPassword;
  }

  onInputChange(event: any): void {
    if (
      this.password === this.confirmPassword &&
      this.password.length > 5 &&
      this.confirmPassword.length > 5
    ) {
      this.newPassword = this.password;
      this.passwordsNotMatch = true;
    } else {
      this.passwordsNotMatch = false;
    }
  }

  onValidityChanged(field: string, isValid: boolean) {
    switch (field) {
      case 'password':
        this.passwordValid = isValid;
        break;
    }
  }

  async resetPW() {
    try {
      const auth = this.auth; // Ensure 'this.auth' is properly injected and available
      const oobCode = this.oobCode;
      const newPassword = this.newPassword;

      await confirmPasswordReset(auth, oobCode, newPassword);
      this.pwReset = true;

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  }
}
