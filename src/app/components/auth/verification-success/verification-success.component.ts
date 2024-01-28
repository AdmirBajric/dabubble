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

  async resetPassword(oobCode: any) {
    this.router.navigate(['/reset-pw', { oobCode: oobCode }]);
  }

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

  redirectUser() {
    setTimeout(() => {
      this.router.navigate(['']);
    }, 6000);
  }
}
