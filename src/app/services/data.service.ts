import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
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

  private scrollToBottomSource = new BehaviorSubject<boolean>(false);
  scrollToBottomAction = this.scrollToBottomSource.asObservable();

  triggerScrollToBottom() {
    this.scrollToBottomSource.next(true);
  }

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
