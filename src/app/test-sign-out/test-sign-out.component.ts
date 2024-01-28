import { Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-sign-out',
  standalone: true,
  imports: [],
  templateUrl: './test-sign-out.component.html',
  styleUrl: './test-sign-out.component.scss',
})
export class TestSignOutComponent {
  constructor(private router: Router) {}
  private auth: Auth = inject(Auth);
  signOutUser() {
    signOut(this.auth)
      .then(() => {
        this.router.navigate(['']);
      })
      .catch((error) => {
        console.error('Fehler beim Abmelden des Benutzers', error);
      });
  }
}
