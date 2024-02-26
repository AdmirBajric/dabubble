import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { MessageHoverActionsComponent } from '../../shared/message-hover-actions/message-hover-actions.component';
import { Comment, Message, Reaction } from '../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  imports: [
    FormsModule,
    HoverChangeDirective,
    MessageHoverActionsComponent,
    NgIf,
    NgFor,
    ProfileViewComponent,
    CommonModule,
    PickerComponent,
  ],
})
export class MessageComponent implements OnInit {
  constructor(
    private navService: chatNavigationService,
    private elementRef: ElementRef,
    private firebaseService: FirebaseService
  ) {}
  @Input() position: string | undefined;
  @Input() message!: Message;
  @Input() typeOfMessage!: string; // either 'mainMessage' or 'comment'
  @Input() messageId!: string | undefined;
  @Input() thread: boolean = false;
  @Output() updatedMessage = new EventEmitter<{
    messageText: string;
    id: string;
  }>();
  showAnswers: boolean = false;
  showEmoji: boolean = false;
  answers: Comment[] = [];
  reactions: any[] = [];
  answersCount!: number;
  lastAnswerTime!: string;
  showActions: boolean = false;
  openMessageEdit: boolean = false;
  showReactionCreator: boolean = true;
  saveOriginalMessage!: string;
  hoveredIndex: number | null = null;
  reactionMap: Map<string, string[]> = new Map<string, string[]>();
  @Input() currentMessage!: Message[];
  user!: User;
  emoji: string = '';

  async ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
    await this.searchForComments();
    await this.searchForReactions();
    this.TimeToStringAnswer();
  }

  async searchForComments() {
    const id = this.getMessageId();
    const querySnapshot = await this.firebaseService.queryDocuments(
      'comments',
      'messageId',
      '==',
      id
    );
    querySnapshot.forEach((doc: any) => {
      let commentData = doc.data();
      commentData['id'] = doc.id;
      this.answers.push(commentData);
      // this.editedComment = commentData['text'];
    });
  }
  /**
   * Gets ID from message for firestore handling and emitting emoji.
   * @returns {*}
   */
  getMessageId() {
    if (this.message && 'id' in this.message) {
      return this.message.id;
    } else {
      return null;
    }
  }

  async searchForReactions() {
    const id = this.getMessageId() as string;
    const collection = this.getType() as string;
    const docRef = this.firebaseService.getDocRef(collection, id);
    this.firebaseService.subscribeToDocumentUpdates(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const existingReactions =
          (docSnapshot.data()?.['reactions'] as Reaction[]) || [];
        this.reactions = existingReactions;

        const emojiCountMap = new Map();

        this.reactions.forEach((item) => {
          const { emoji, fullName, userId } = item;

          if (emojiCountMap.has(emoji)) {
            emojiCountMap.set(emoji, emojiCountMap.get(emoji) + 1);
          } else {
            emojiCountMap.set(emoji, 1);
          }
        });

        const result: { emoji: string; count: number; users: string[] }[] = [];
        emojiCountMap.forEach((count, emoji) => {
          const users = this.reactions
            .filter((item) => item.emoji === emoji)
            .map((item) => item.fullName);
          result.push({ emoji, count, users });
        });

        this.reactions = result;
      }
    });
  }

  getType() {
    if (this.typeOfMessage === 'mainMessage') {
      return 'messages'
    } else if (this.typeOfMessage === 'comment') {
      return 'comments'
    } else {
      return;
    }
  }

  getTimeFromString(dateTimeString: Date): string {
    const dateObject = new Date(dateTimeString);

    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();

    // Führende Nullen hinzufügen, wenn die Minuten einstellig sind
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;

    // Das resultierende Zeitformat ist z.B. "10:30"
    const zeitFormat = `${stunden}:${formatierteMinuten}`;

    return zeitFormat;
  }

  TimeToStringAnswer() {
    this.countAnswers();
    if (this.answers.length > 0) {
      let time = this.answers[this.answersCount - 1].timestamp;
      this.lastAnswerTime = this.getTimeFromString(time);
    }
  }

  countAnswers() {
    this.answersCount = this.answers.length;
  }

  showAnswersinThread(m: Message) {
    this.navService.openThread(m);
  }

  /**
   * Handles the hover actions,
   * saves the original message in case user cancels editing,
   * opens the input field for message editing.
   * @param {Message} m
   */
  editMessage(m: Message) {

    m.reactions.forEach((reaction: any) => {
      if (reaction.userId === this.user.id) {
        this.emoji = reaction.emoji;
      }
    });

    this.closeMessageHoverActions();
    this.saveOriginalMessage = m.text;
    this.openMessageEdit = true;
  }

  closeMessageHoverActions() {
    this.showActions = false;
  }

  /**
   * Emits the edited text of message to main-chat.component to be updated from there.
   * Closes the input field for message editing.
   * @param {string} messageText
   * @param {string} id
   */
  saveEditedMessage(messageText: string) {
    const id = this.getMessageId() as string;
    this.updatedMessage.emit({ messageText, id });
    this.openMessageEdit = false;
    this.setAndSaveEmoji(this.messageId, this.emoji);
  }

  /**
   * Cancels the message editing by closing the input field for message editing &
   * returns the original message text.
   */
  cancelMessageEditing() {
    this.openMessageEdit = false;
    this.message.text = this.saveOriginalMessage;
  }

  toggleShowActions() {
    this.showActions = !this.showActions;
  }

  toggleShowActionsOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showActions = false;
    }
  }

  checkClickLocation(event: Event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      event.stopPropagation();
    } else {
      this.showActions = false;
    }
  }


  addEmoji(){

  }

  async emitEmoji(event: any, id: any) {
    const emoji = this.getEmojiNative(event);
    if (id && emoji) {
      this.emoji = emoji;
      this.messageId = id;
      this.addEmoji();
    }
  }

  async setAndSaveEmoji(id: any, emoji: string) {
    try {
      const reaction = new Reaction({
        fullName: this.user.fullName,
        userId: this.user.id,
        emoji: emoji,
      });
      const reactionJSON = reaction.toJSON();

      const docSnapshot = await this.firebaseService.getDocument(
        'messages',
        id
      );
      if (docSnapshot.exists()) {
        let existingReactions = docSnapshot.data()?.['reactions'] || [];

        const existingReactionIndex = existingReactions.findIndex(
          (reaction: any) => reaction.userId === this.user.id
        );
        if (existingReactionIndex !== -1) {
          existingReactions[existingReactionIndex] = reactionJSON;
        } else {
          existingReactions.push(reactionJSON);
        }

        await this.firebaseService.updateDocument('messages', id, {
          reactions: existingReactions,
        });
      } else {
        console.error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  getEmojiNative(e: any): string | null {
    if (e.emoji && 'native') {
      return e.emoji.native;
    } else {
      return null;
    }
  }
}
