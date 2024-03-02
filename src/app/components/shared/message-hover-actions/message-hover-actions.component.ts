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

  /**
   * Initializes the component by retrieving and parsing the 'loggedInUser' from localStorage, if available.
   */
  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  /**
   * Stops the propagation of the click event and initiates the process of editing a message.
   * It also emits the message editing status to the parent component.
   * @param {Event} event - The DOM event triggered by the user interaction.
   */
  openEditMessage(event: Event) {
    event.stopPropagation();
    this.handlingTooltip();
    this.messageEditing = true;
    this.editMessage.emit(this.messageEditing);
  }

  /**
   * Hides the tooltip by setting `showToolTip` to false.
   */
  handlingTooltip() {
    this.showToolTip = false;
  }

  /**
   * Toggles the visibility of the tooltip and stops the event from bubbling up.
   * @param {Event} event - The DOM event triggered by the user interaction.
   */
  toggleToolTip(event: Event) {
    event.stopPropagation();
    this.showToolTip = !this.showToolTip;
  }

  /**
   * Uses the navigation service to open a thread related to the current message.
   */
  openThread() {
    this.navService.openThread(this.currentMessage);
  }

  /**
   * Toggles the state of the emoji picker based on the context (main message or comment).
   * @param {string} from - The context from which the emoji picker is being opened.
   */
  openEmojiMart(from: string) {
    if (from === 'mainMessage' && 'comment') {
      this.active = !this.active;
    } else {
      this.activeComment = !this.activeComment;
    }
  }

  /**
   * Sets an emoji for a main message with given emojis and saves it.
   * @param {string} emoji - The emoji to be set.
   * @param {string} StringOrId - The context (mainMessage or comment).
   */
  // this is only used when it is a main message with given emojis...
  async setEmoji(emoji: string, StringOrId: string) {
    const id = this.getMessageID() as string;
    if (id && emoji) {
      this.setAndSaveEmoji(id, emoji, StringOrId);
    }
  }

  /**
   * Emits an emoji based on the user selection and saves it.
   * @param {any} event - The emoji selection event.
   * @param {string} [messageType='mainMessage'] - The context of the message (mainMessage or comment).
   */
  //StringOrId can be mainMessage oder comment
  async emitEmoji(event: any, messageType: string = 'mainMessage') {
    const id = this.getMessageID() as string;
    const emoji = this.getEmojiNative(event);
    this.openEmojiMart(messageType);
    if (id && emoji) {
      this.setAndSaveEmoji(id, emoji, messageType);
    }
  }

  /**
   * Saves the selected emoji for the message and updates the Firestore document.
   * @param {string} id - The ID of the message or comment.
   * @param {string} emoji - The selected emoji.
   * @param {string} messageType - The context (mainMessage or comment).
   */
  async setAndSaveEmoji(id: string, emoji: string, messageType: string) {
    this.active = false;
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

  /**
   * Saves the reaction to a comment in Firestore and updates the document.
   * @param {any} reactionJSON - The reaction object to be saved.
   */
  async saveReactionComments(reactionJSON: any): Promise<void> {
    const id = this.getMessageID() as string;
    const docSnapshot = await this.firebaseService.getDocument('comments', id);

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

  /**
   * Extracts the native representation of an emoji from an event.
   * @param {any} e - The event containing the emoji selection.
   * @returns {string | null} The native string representation of the emoji, if available.
   */
  getEmojiNative(e: any): string | null {
    if (e.emoji && 'native') {
      return e.emoji.native;
    } else {
      return null;
    }
  }
}
