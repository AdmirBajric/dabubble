import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class chatNavigationService implements OnInit {
  private threadOpenStatus!: boolean;
  private isThreadOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private channelOpenStatus!: boolean;
  private isChannelOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private currentChannel$ = new BehaviorSubject<any>(null);

  private currentMessage$ = new BehaviorSubject<any>(null);

  private channelsUpdatedSubject = new Subject<any[]>();
  channelsUpdated$ = this.channelsUpdatedSubject.asObservable();

  constructor() {
    this.isThreadOpen$.subscribe((value) => {
      this.threadOpenStatus = value;
    });

    this.isChannelOpen$.subscribe((value) => {
      this.channelOpenStatus = value;
    });
  }

  updateChannels(channels: any[]) {
    this.channelsUpdatedSubject.next(channels);
  }

  ngOnInit(): void {}

  openThread(message: any[]) {
    this.currentMessage$.next(message);
    this.isThreadOpen$.next(true);
  }

  openChannel(channel: any[]) {
    this.currentChannel$.next(channel);
    this.isChannelOpen$.next(true);
  }

  closeThread() {
    this.isThreadOpen$.next(false);
  }

  updateChannelStatus(status: boolean) {
    this.isChannelOpen$.next(status);
  }

  /**
   * Observable to be subscribed by components that need information about thread.component status.
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

  get isChannelOpen(): boolean {
    return this.channelOpenStatus;
  }
}
