import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LogoComponent } from '../../shared/logo/logo.component';
import { Auth, applyActionCode } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [MatCardModule, LogoComponent],
  templateUrl: './verification-success.component.html',
  styleUrls: ['./verification-success.component.scss'],
})
export class VerificationSuccessComponent {
  private auth: Auth = inject(Auth);

  /**
   * Subscribes to query parameters changes to handle email verification and password reset based on the 'mode' and 'oobCode' query parameters.
   * @constructor
   * @param {Router} router
   * @param {ActivatedRoute} route
   */
  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(async (params) => {
      const oobCode = params['oobCode'];
      const mode = params['mode'];
      if (mode === 'verifyEmail') {
        await this.verifyEmail(oobCode);
      } else if (mode === 'resetPassword') {
        await this.resetPassword(oobCode);
      }
    });
  }

  /**
   * Navigates to the password reset page, passing the one-time code (oobCode) as a route parameter.
   * @param {any} oobCode - The one-time code used for resetting the password.
   */
  async resetPassword(oobCode: any) {
    this.router.navigate(['/reset-pw', { oobCode: oobCode }]);
  }

  /**
   * Attempts to verify the user's email using the provided one-time code (oobCode).
   * If verification is successful or the code is invalid, the user is redirected.
   * @param {string} oobCode - The one-time code used for email verification.
   * @returns {Promise<void>} A promise that resolves when the email verification process is complete.
   */
  async verifyEmail(oobCode: string): Promise<void> {
    try {
      await applyActionCode(this.auth, oobCode);
      this.redirectUser();
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        this.redirectUser();
      } else {
        console.error('Verifizierung fehlgeschlagen:', error);
      }
    }
  }

  /**
   * Redirects the user to the home page after a delay.
   */
  redirectUser() {
    setTimeout(() => {
      this.router.navigate(['']);
    }, 6000);
  }
}
