import { Injectable } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(rxjsOperators.map((user: User | null) => !!user));
  }
}
