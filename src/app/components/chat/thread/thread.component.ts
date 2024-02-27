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
import { ChatHeaderComponent } from "../../shared/chat-header/chat-header.component";
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { Comment, Message } from '../../../models/message.class';

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
    MessageComponent,
    ChatHeaderComponent
  ]
})
export class ThreadComponent implements OnInit {
  currentMessage!: Message;
  private messageSubscription!: Subscription;
  private threadStatusSubscription!: Subscription;
  user!: User;
  answersCount!: number;
  mobileView!: boolean;
  windowWidth!: number;
  answers: Comment[] = [];

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    public router: Router,
    private navService: chatNavigationService,
    private firebaseService: FirebaseService,
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
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
    this.subscribeThreadStatus();
    this.subscribeMessage();
    this.searchForComments();
  }

  getTimeFromString(dateTimeString: string): string {
    const dateObject = new Date(dateTimeString);
    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;
    const zeitFormat = `${stunden}:${formatierteMinuten}`;
    return zeitFormat;
  }

  async searchForComments() {
    try {
      const id = this.getMessageId();
      const querySnapshot = await this.firebaseService.queryDocuments(
        'comments',
        'messageId',
        '==',
        id
      );

      if (querySnapshot) {
        querySnapshot.forEach((doc: any) => {
          let commentData = doc.data();
          commentData['id'] = doc.id;
          //check if the comment is already in local answers arra to avoid duplicates
          const commentExists = this.answers.some(answer => answer.id === commentData.id);
          if (!commentExists) {
            this.answers.push(commentData);
          }
        });
        this.countAnswers();
      }
    } catch (error) {
      console.error(error)
    }
  }


  countAnswers() {
    this.answersCount = this.answers.length;
  }

  prepareComment(event: { commentText: string, commentFile: string }) {
    const id = this.getMessageId();
    const text = event.commentText;
    const file = event.commentFile;
    const comment = new Comment({
      text: text,
      timestamp: new Date(),
      creator: this.user,
      reactions: [],
      messageId: id,
      isChannelMessage: false,
      edited: false,
      file: file,
      privateMsg: false //DYNAMISCH ANPASSEN
    });
    this.sendComment(comment);
  }

  getMessageId() {
    if (this.currentMessage && 'id' in this.currentMessage) {
      return this.currentMessage.id;
    } else {
      return null;
    }
  }

  async sendComment(comment: Comment): Promise<void> {
    try {
      const commentJSON = comment.toJSON();
      await this.firebaseService.addDocument('comments', commentJSON);
      this.searchForComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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
