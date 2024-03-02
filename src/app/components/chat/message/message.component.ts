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
  }

  /**
   * Searches for comments associated with the current message and updates the component state with these comments.
   * Converts the timestamp of the last comment to a string for display purposes.
   */
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
      this.timeToStringAnswer();
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

  /**
   * Searches for reactions associated with the current message
   * Processes reactions to aggregate counts for each emoji and the users who reacted with them.
   */
  async searchForReactions() {
    const id = this.getMessageId() as string;
    let collection = await this.getType();

    if (collection === undefined) {
      collection = 'messages';
    }

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

        const result: {
          emoji: string;
          count: number;
          users: { fullName: string; userId: string }[];
        }[] = [];
        emojiCountMap.forEach((count, emoji) => {
          const users = this.reactions
            .filter((item) => item.emoji === emoji)
            .map((item) => ({ fullName: item.fullName, userId: item.userId }));
          result.push({ emoji, count, users });
        });

        this.reactions = result;
      }
    });
  }

  /**
   * Determines the Firestore collection type based on the message type.
   * @returns {string|undefined} The collection type as a string or undefined if the type doesn't match known values.
   */
  async getType() {
    if (this.typeOfMessage === 'mainMessage') {
      return 'messages';
    } else if (this.typeOfMessage === 'comment') {
      return 'comments';
    } else {
      return;
    }
  }

  /**
   * Converts a date and time string to a formatted time string.
   * @param {Date} dateTimeString The date and time string to format.
   * @returns {string} The formatted time string.
   */
  getTimeFromString(dateTimeString: Date): string {
    const dateObject = new Date(dateTimeString);

    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;
    const zeitFormat = `${stunden}:${formatierteMinuten}`;

    return zeitFormat;
  }

  /**
   * Updates the last answer time for the most recent comment.
   */
  async timeToStringAnswer() {
    this.countAnswers();
    if (this.answers.length > 0) {
      let time = this.answers[this.answersCount - 1].timestamp;
      this.lastAnswerTime = this.getTimeFromString(time);
    }
  }

  /**
   * Counts the number of answers (comments) and updates the component state.
   */
  countAnswers() {
    this.answersCount = this.answers.length;
  }

  /**
   * Opens the thread view for a given message.
   * @param {Message} m The message for which the thread view should be opened.
   */
  showAnswersinThread(m: Message) {
    this.navService.openThread(m);
  }

  /**
   * Handles the hover actions,
   * saves the original message in case user cancels editing,
   * opens the input field for message editing.
   * @param {Message} m
   */
  async editMessage(m: Message) {
    this.reactions.forEach((reaction: any) => {
      reaction.users.forEach((user: any) => {
        if (user.userId === this.user.id) {
          this.emoji = reaction.emoji;
        }
      });
    });

    this.closeMessageHoverActions();
    this.saveOriginalMessage = m.text;
    this.openMessageEdit = true;
  }

  /**
   * Closes message hover actions, resetting related component state.
   */
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
  }

  /**
   * Cancels the message editing process, restoring the original message text and closing hover actions.
   */
  cancelMessageEditing() {
    this.openMessageEdit = false;
    this.message.text = this.saveOriginalMessage;
    this.closeMessageHoverActions();
  }

  /**
   * Toggles the visibility of message actions (like, edit, delete).
   */
  toggleShowActions() {
    this.showActions = !this.showActions;
  }

  /**
   * Toggles the visibility of message actions when clicking outside the message component.
   * @param {Event} event The DOM event triggered by clicking outside the message component.
   */
  toggleShowActionsOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showActions = false;
    }
  }

  /**
   * Checks the click location to determine whether to stop event propagation or close message actions.
   * @param {Event} event The DOM event triggered by clicking.
   */
  checkClickLocation(event: Event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      event.stopPropagation();
    } else {
      this.showActions = false;
    }
  }

  /**
   * Toggles the visibility of the emoji picker container.
   */
  toggleEmojiContainer() {
    this.showEmoji = !this.showEmoji;
  }

  /**
   * Adds an emoji to the message text and hides the emoji picker.
   * @param {any} event The emoji selection event containing the selected emoji.
   */
  addEmoji(event: any): void {
    this.emoji = event.emoji.native;
    this.showEmoji = false;
    this.message.text += this.emoji;
  }
}
