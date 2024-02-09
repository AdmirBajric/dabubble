import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from '../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class chatNavigationService {
  private isThreadOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private threadOpenStatus!: boolean;

  private currentMessage$ = new BehaviorSubject<any>(null); 

  constructor() {
    this.isThreadOpen$.subscribe((value) => {
      this.threadOpenStatus = value;
    })
  }

  openThread(message: any[]) {
    this.currentMessage$.next(message);
    this.isThreadOpen$.next(true);
  }

  cloesThread(){
    this.isThreadOpen$.next(false);
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

  get currentMessage(){
    return this.currentMessage$.asObservable();
  }
}
