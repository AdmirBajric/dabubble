import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from '../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class chatNavigationService {
  private threadOpenStatus!: boolean;
  private isThreadOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private channelOpenStatus!: boolean;
  private isChannelOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentChannel$ = new BehaviorSubject<any>(null);

  private currentMessage$ = new BehaviorSubject<any>(null);

  constructor() {
    this.isThreadOpen$.subscribe((value) => {
      this.threadOpenStatus = value;
    })

    this.isChannelOpen$.subscribe((value) => {
      this.channelOpenStatus = value;
    })
  }

  openThread(message: Message) {
    this.currentMessage$.next(message);
    this.isThreadOpen$.next(true);
  }

  openChannel(channel: any[]) {
    this.currentChannel$.next(channel);
    this.isChannelOpen$.next(true);
  }

  cloesThread() {
    this.isThreadOpen$.next(false);
  }

  closeChat(){
    this.isChannelOpen$.next(false);
  }

  /**
   * Observable to be subsribed by components that need information about thread.component status.
   *
   * @readonly
   * @type {*}
   */
  get threadStatus$() {
    return this.isThreadOpen$.asObservable();
  }

  get isThreadOpen(): boolean {
    return this.threadOpenStatus;
  }

  get currentMessage() {
    return this.currentMessage$.asObservable();
  }

  get currentChannel() {
    return this.currentChannel$.asObservable();
  }

  get channelStatus$() {
    return this.isChannelOpen$.asObservable();
  }
}
