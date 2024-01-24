import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSource = new BehaviorSubject<User | null>(null);
  currentUser = this.userSource.asObservable();

  changeUser(user: User): void {
    this.userSource.next(user);
  }
}
