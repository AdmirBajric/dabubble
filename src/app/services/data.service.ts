import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private triggerFunctionSubject = new Subject<void>();
  triggerFunction$ = this.triggerFunctionSubject.asObservable();
  triggerShowUsers: EventEmitter<void> = new EventEmitter<void>();

  triggerFunction() {
    this.triggerFunctionSubject.next();
  }

  showUsers(): void {}

  private userSource = new BehaviorSubject<User | null>(null);
  currentUser = this.userSource.asObservable();

  private createdUserSource = new BehaviorSubject<any | null>(null);
  newCreatedUser = this.createdUserSource.asObservable();

  private userIdSource = new BehaviorSubject<string | null>(null);
  currentUserId = this.userIdSource.asObservable();

  private channelInfoSource = new BehaviorSubject<{
    channelName: string;
    description: string;
  } | null>(null);
  currentChannelInfo = this.channelInfoSource.asObservable();

  changeUser(user: User): void {
    this.userSource.next(user);
  }

  setCreatedUser(createdUser: any): void {
    this.createdUserSource.next(createdUser);
  }

  sendUserId(userId: string): void {
    this.userIdSource.next(userId);
  }

  sendChannelInfo(channelName: string, description: string): void {
    const channelInfo = { channelName, description };
    this.channelInfoSource.next(channelInfo);
  }
}
