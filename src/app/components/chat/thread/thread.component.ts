import {
  Component,
  ElementRef,
  HostListener,
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
import { MessageComponent } from '../message/message.component';
import { ChatHeaderComponent } from '../../shared/chat-header/chat-header.component';
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
    ChatHeaderComponent,
  ],
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
  private commentsListenerUnsubscribe: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    public router: Router,
    private navService: chatNavigationService,
    private firebaseService: FirebaseService
  ) {}

  /**
   * Host listener for window resize events to adjust views based on window size.
   * @param {Event} event - window resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Host listener for window load events to set initial view based on window size.
   * @param {Event} event - window load event.
   */
  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
  }

  /**
   * Checks the window size and sets the mobile view state accordingly.
   */
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

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   */
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
    this.listenForRealTimeComments();
  }

  /**
   * Subscribes to real-time updates of comments for the current message.
   */
  listenForRealTimeComments() {
    const id = this.getMessageId();

    // Replace 'this.currentMessage.id' with the actual message ID you want to listen for comments
    this.commentsListenerUnsubscribe =
      this.firebaseService.listenForRealTimeComments(
        this.currentMessage.id ?? '',
        (comments) => {
          // Update comments in the component when real-time updates occur
          this.answers = comments;
          this.countAnswers(); // Update answers count as well
        }
      );
  }

  /**
   * Is being called when event is emited.
   * Saves the edited message and marks is as edited in Firestore database.
   * @async
   * @param {{messageText: string, id: string}} event - An object containing the edited text and the message id.
   * @returns {*}
   */
  async saveEditedMessage(event: { messageText: string; id: string }) {
    const docSnapshot = await this.firebaseService.getDocument(
      'comments',
      event.id
    );

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('comments', event.id, {
        text: event.messageText,
        edited: true,
      });
    }
  }

  /**
   * Converts a date-time string to a formatted time string (HH:MM).
   * @param {string} dateTimeString - date-time string to format.
   * @returns {string} - formatted time string.
   */
  getTimeFromString(dateTimeString: string): string {
    const dateObject = new Date(dateTimeString);
    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;
    const zeitFormat = `${stunden}:${formatierteMinuten}`;
    return zeitFormat;
  }

  /**
   * Fetches comments for the current message and updates the local state.
   */
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
          const commentExists = this.answers.some(
            (answer) => answer.id === commentData.id
          );
          if (!commentExists) {
            this.answers.push(commentData);
          }
        });
        this.countAnswers();
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Updates the count of answers/comments.
   */
  countAnswers() {
    this.answersCount = this.answers.length;
  }

  /**
   * Prepares a new comment based on user input and sends it.
   * @param {{ commentText: string; commentFile: string }} event - user input event containing comment text and file.
   */
  prepareComment(event: { commentText: string; commentFile: string }) {
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
      privateMsg: false, //DYNAMISCH ANPASSEN
    });
    this.sendComment(comment);
  }

  /**
   * Retrieves the ID of the current message.
   * @returns {string | null} - ID of the current message, or null if not available.
   */
  getMessageId() {
    if (this.currentMessage && 'id' in this.currentMessage) {
      return this.currentMessage.id;
    } else {
      return null;
    }
  }

  /**
   * Sends a new comment to the server.
   * @param {Comment} comment - comment object to send.
   */
  async sendComment(comment: Comment): Promise<void> {
    try {
      const commentJSON = comment.toJSON();
      await this.firebaseService.addDocument('comments', commentJSON);
      this.searchForComments();
    } catch (error) {}
  }

  /**
   * Subscribes to the current message updates.
   */
  subscribeMessage() {
    this.navService.currentMessage.subscribe((message) => {
      this.currentMessage = message;
    });
  }

  /**
   * Subscribes to thread status updates to manage comment subscriptions.
   */
  subscribeThreadStatus() {
    this.threadStatusSubscription = this.navService.threadStatus$.subscribe(
      (isOpen) => {
        this.answers.length = 0;
        this.searchForComments();
        if (!isOpen) {
          if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
          }
        }
      }
    );
  }

  /**
   * Cleans up subscriptions and listeners when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.threadStatusSubscription) {
      this.threadStatusSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.commentsListenerUnsubscribe) {
      this.commentsListenerUnsubscribe();
    }
  }
}
