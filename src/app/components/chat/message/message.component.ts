import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ProfileViewComponent } from "../../profile/profile-view/profile-view.component";
import { MessageHoverActionsComponent } from '../../shared/message-hover-actions/message-hover-actions.component';
import { Comment, Message, Reaction } from '../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';


@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  imports: [FormsModule, HoverChangeDirective, MessageHoverActionsComponent, NgIf, NgFor, ProfileViewComponent]
})
export class MessageComponent implements OnInit {
  constructor(private navService: chatNavigationService,
    private firebaseService: FirebaseService
  ) { }
  @Input() message!: Message;
  @Input() messageId!: string | undefined;
  @Output() updatedMessage = new EventEmitter<{ messageText: string, id: string }>();
  showAnswers: boolean = false;
  answers: Comment[] = [];
  reactions: Reaction[] = [];
  answersCount!: number;
  lastAnswerTime!: string;
  showActions: boolean = false;
  openMessageEdit: boolean = false;
  showReactionCreator: boolean = true;
  saveOriginalMessage!: string;       // to reset the message text when editing is cancelled
  hoveredIndex: number | null = null;
  user!: User;

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
    const querySnapshot = await this.firebaseService.queryDocuments(
      'comments',
      'messageId',
      '==',
      this.message.id
    );
    querySnapshot.forEach((doc: any) => {
      let commentData = doc.data();
      commentData['id'] = doc.id;
      this.answers.push(commentData);
      // this.editedComment = commentData['text'];
    });
  }

  async searchForReactions() {
    const id = this.getMessageId() as string;
    const docSnapshot = await this.firebaseService.getDocument(
      'messages',
      id
    );
    if (docSnapshot.exists()) {
      const existingReactions = docSnapshot.data()?.['reactions'] as Reaction[] || [];
      this.reactions = [];
      existingReactions.forEach((reaction: Reaction) => {
        this.reactions.push(reaction);
      });
    }
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

  isMultipleEmojis(emojiString: string): boolean {
    // Diese Funktion nimmt an, dass die meisten einzelnen Emojis eine Länge von 2 haben,
    // was nicht immer zutrifft, besonders bei zusammengesetzten Emojis.
    return emojiString.length > 2;
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
  }

  /**
   * Cancels the message editing by closing the input field for message editing &
   * returns the original message text.
   */
  cancelMessageEditing() {
    this.openMessageEdit = false;
    this.message.text = this.saveOriginalMessage;
  }

  addEmoji() {

  }

}
