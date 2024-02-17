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
  imports: [HoverChangeDirective, MatTooltipModule, NgIf, PickerComponent],
  templateUrl: './message-hover-actions.component.html',
  styleUrl: './message-hover-actions.component.scss'
})
export class MessageHoverActionsComponent {
  @Input() isYou!: boolean;
  @Input() currentMessage!: Message[];
  @Output() editMessage: EventEmitter<boolean> = new EventEmitter<boolean>();
  messageEditing!: boolean;
  showToolTip: boolean = false;
  user!: User;
  activeComment: boolean = false;
  active: boolean = false;

  constructor(
    private navService: chatNavigationService,
    private firebaseService: FirebaseService
  ) {
  }

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  openEditMessage($event: MouseEvent) {
    $event.stopPropagation();
    this.handlingTooltip();
    this.messageEditing = true;
    this.editMessage.emit(this.messageEditing);
  }

  handlingTooltip() {
    this.showToolTip = false;
  }

  openThread() {
    this.navService.openThread(this.currentMessage);
  }

  openEmojiMart(from: string) {
    if (from === 'mainMessage') {
      this.active = !this.active;
    } else {
      this.activeComment = !this.activeComment;
    }
  }

  async emitEmoji(event: any, StringOrId: string) {
    const id = this.getMessageID() as string;
    const emoji = this.getEmojiNative(event);
    this.openEmojiMart(StringOrId);
    console.log('emoji:', emoji, id);
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
        if (StringOrId === 'mainMessage') {
          // let existingReactions = docSnapshot.data()?.['reactions'] || [];
          await this.firebaseService.updateDocument(
            'messages',
            id,
            {
              reactions: arrayUnion(reactionJSON),
            }
          );
          // this.showReactionOnMainChannel();
        } else {
          this.saveReactionComments(reactionJSON, StringOrId);
        }
      } else {
        console.error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  async saveReactionComments(
    reactionJSON: any,
    StringOrId: string
  ): Promise<void> {
    const docSnapshot = await this.firebaseService.getDocument(
      'comments',
      StringOrId
    );
    if (docSnapshot.exists()) {
      let existingReactions = docSnapshot.data()?.['reactions'] || [];
      await this.firebaseService.updateDocument('comments', StringOrId, {
        reactions: arrayUnion(reactionJSON, ...existingReactions),
      });
      // this.showComments();
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
      return e.emoji.native
    } else {
      return null
    }
  }
}
