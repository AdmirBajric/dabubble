import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Message, Reaction } from '../../../models/message.class';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { arrayUnion } from '@angular/fire/firestore';

@Component({
  selector: 'app-message-hover-actions',
  standalone: true,
  imports: [
    CommonModule,
    HoverChangeDirective,
    MatTooltipModule,
    NgIf,
    PickerComponent,
  ],
  templateUrl: './message-hover-actions.component.html',
  styleUrl: './message-hover-actions.component.scss',
})
export class MessageHoverActionsComponent {
  @Input() position!: string;
  @Input() isYou!: boolean;
  @Input() thread: boolean = false;
  @Input() currentMessage!: Message;
  // ******needed to set Emoji according to type.
  // ******Can be 'mainMessage', 'comment'
  @Input() typeOfMessage!: string;
  @Output() editMessage: EventEmitter<boolean> = new EventEmitter<boolean>();
  messageEditing!: boolean;
  showToolTip: boolean = false;
  user!: User;
  activeComment: boolean = false;
  active: boolean = false;

  constructor(
    private navService: chatNavigationService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  openEditMessage(event: Event) {
    event.stopPropagation();
    this.handlingTooltip();
    this.messageEditing = true;
    this.editMessage.emit(this.messageEditing);
  }

  handlingTooltip() {
    this.showToolTip = false;
  }

  toggleToolTip(event: Event) {
    event.stopPropagation();
    this.showToolTip = !this.showToolTip;
  }

  openThread() {
    this.navService.openThread(this.currentMessage);
  }

  openEmojiMart(from: string) {
    if (from === 'mainMessage' && 'comment') {
      this.active = !this.active;
    } else {
      this.activeComment = !this.activeComment;
    }
  }

  // this is only used when it is a main message with given emojis...
  async setEmoji(emoji: string, StringOrId: string) {
    const id = this.getMessageID() as string;
    if (id && emoji) {
      this.setAndSaveEmoji(id, emoji, StringOrId);
    }
  }

  //StringOrId can be mainMessage oder comment
  async emitEmoji(event: any, messageType: string = 'mainMessage') {
    const id = this.getMessageID() as string;
    const emoji = this.getEmojiNative(event);
    this.openEmojiMart(messageType);
    if (id && emoji) {
      this.setAndSaveEmoji(id, emoji, messageType);
    }
  }

  async setAndSaveEmoji(id: string, emoji: string, messageType: string) {
    this.active = false;
    console.log(id);
    console.log(this.user);

    console.log(messageType);

    try {
      const reaction = new Reaction({
        fullName: this.user.fullName,
        userId: this.user.id,
        emoji: emoji,
      });
      const reactionJSON = reaction.toJSON();

      if (messageType === 'mainMessage') {
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
      } else if (messageType === 'comment') {
        this.saveReactionComments(reactionJSON);
      }
    } catch (error) {
      console.error(
        'Error updating document:',
        error,
        'Nachrichtentyp:',
        messageType
      );
    }
  }

  async saveReactionComments(reactionJSON: any): Promise<void> {
    const id = this.getMessageID() as string;
    const docSnapshot = await this.firebaseService.getDocument('comments', id);

    if (docSnapshot.exists()) {
      let existingReactions = docSnapshot.data()?.['reactions'] || [];

      const existingReactionIndex = existingReactions.findIndex(
        (reaction: any) => reaction.userId === this.user.id
      );

      console.log(existingReactionIndex);

      if (existingReactionIndex !== -1) {
        existingReactions[existingReactionIndex] = reactionJSON;
      } else {
        existingReactions.push(reactionJSON);
      }

      await this.firebaseService.updateDocument('comments', id, {
        reactions: existingReactions,
      });
    } else {
      console.error('Document not found');
    }
  }

  /**
   * Gets ID from message for firestore handling and emitting emoji.
   * @returns {*}
   */
  getMessageID() {
    if (this.currentMessage && 'id' in this.currentMessage) {
      return this.currentMessage.id;
    } else {
      return null;
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
