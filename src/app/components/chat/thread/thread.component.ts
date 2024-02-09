import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmojisComponent } from '../../shared/emojis/emojis.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { WorkspaceHeaderComponent } from '../../dashboard/workspace/workspace-header/workspace-header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { MessageComponent } from "../message/message.component";

@Component({
  selector: 'app-thread',
  standalone: true,
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
  imports: [
    CommonModule,
    EmojisComponent,
    PickerModule,
    MessageInputComponent,
    WorkspaceHeaderComponent,
    MessageComponent
  ]
})
export class ThreadComponent implements OnInit {
  @Input() threadData!: any;
  currentMessage!: any;
  private messageSubscription!: Subscription;
  private threadStatusSubscription!: Subscription;

  loggedUser = 'Julius Marecek';
  answersCount!: number;
  mobileView!: boolean;
  windowWidth!: number;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    public router: Router,
    private navService: chatNavigationService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;

    if (this.windowWidth <= 1100) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }

  ngOnInit() {
    this.subscribeThreadStatus();
    this.subscribeMessage();
    console.log('THREAD', this.currentMessage);
    this.countAnswers();
  }

  getTimeFromString(dateTimeString: string): string {
    const dateObject = new Date(dateTimeString);
    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;
    const zeitFormat = `${stunden}:${formatierteMinuten}`;
    return zeitFormat;
  }

  countAnswers() {
    this.answersCount = this.threadData.answers.length;
  }

  subscribeMessage() {
    this.navService.currentMessage.subscribe(message => {
      this.currentMessage = message;
    })
  }

  subscribeThreadStatus() {
    this.threadStatusSubscription = this.navService.threadStatus$.subscribe(isOpen => {
      if (!isOpen) {
        if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
        }
      }
    })
  }

  ngOnDestroy() {
    if (this.threadStatusSubscription) {
      this.threadStatusSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
