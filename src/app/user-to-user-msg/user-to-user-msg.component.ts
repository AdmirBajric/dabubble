import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Message, Reaction, Comment } from '../models/message.class';
import { User } from '../models/user.class';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { arrayUnion } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-to-user-msg',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PickerComponent],
  templateUrl: './user-to-user-msg.component.html',
  styleUrl: './user-to-user-msg.component.scss',
})
export class UserToUserMsgComponent implements OnInit {
  users: any[] = [];
  clickedUser: any = {};
  loggedUser: any;
  text: string = '';
  newText: string = '';
  commentText: string = '';
  messages: any[] = [];
  messageId: string = '';
  editMessageId: string | null = null;
  editingCommentId: number | null = null;
  editedComment: any;
  active: boolean = false;
  commentActive: boolean = false;
  editEmojiMessageId: string | null = null;
  editEmojiThreadId: string | null = null;
  editEmojiCommentId: string | null = null;
  threads: any[] = [];
  comments: any[] = [];
  private unsubscribeRealTimeUpdates: (() => void) | undefined;
  private unsubscribeCommentsRealTimeUpdates: (() => void) | undefined;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.loggedUser = parsedUser;
      this.firebaseService
        .getAllUsers()
        .then((users) => {
          this.users = users;
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
        });
    }

    if (this.messageId) {
      this.startRealTimeCommentUpdates(this.messageId);
    }
  }

  editComment(comment: any) {
    this.editedComment = comment.text;
    this.editingCommentId = comment.id;
  }

  saveComment(comment: any) {
    this.updateComment(comment.id);
    this.editingCommentId = null;
  }

  cancelEdit() {
    this.editingCommentId = null;
  }

  async updateComment(id: string) {
    const docSnapshot = await this.firebaseService.getDocument('comments', id);

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('comments', id, {
        text: this.editedComment,
        edited: true,
      });
    }
  }

  startRealTimeCommentUpdates(messageId: string) {
    this.unsubscribeCommentsRealTimeUpdates =
      this.firebaseService.listenForRealTimeComments(messageId, (comments) => {
        this.comments = comments;
        const messageIndex = this.messages.findIndex(
          (message) => message.id === messageId
        );
        if (messageIndex !== -1) {
          this.messages[messageIndex].comment = this.comments.length.toString();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeCommentsRealTimeUpdates) {
      this.unsubscribeCommentsRealTimeUpdates();
    }
  }

  startConversation(user: User) {
    this.clickedUser = user;
    this.searchMessages(user);
    this.startRealTimeUpdates(user);
  }

  async searchMessages(recipient: User) {
    const channel = false;

    this.firebaseService.searchMessagesRealTime(
      channel,
      recipient,
      this.loggedUser,
      async (messagesWithIds) => {
        this.messages = [];
        this.messages = await Promise.all(
          messagesWithIds.map(async (item) => {
            const message = item.message;
            message.id = item.id;
            message.comment = await this.showCommentsLength(item.id);
            this.startRealTimeCommentUpdates(message.id);
            return message;
          })
        );
      }
    );
  }

  private startRealTimeUpdates(recipient: User) {
    const channel = false;
    this.unsubscribeRealTimeUpdates =
      this.firebaseService.searchMessagesRealTime(
        channel,
        recipient,
        this.loggedUser,
        async (messagesWithIds) => {
          this.messages = [];
          this.messages = await Promise.all(
            messagesWithIds.map(async (item) => {
              const message = item.message;
              message.id = item.id;
              message.comment = await this.showCommentsLength(item.id);
              this.startRealTimeCommentUpdates(message.id);
              return message;
            })
          );
        }
      );
  }

  async showCommentsLength(id: any): Promise<string> {
    try {
      const querySnapshot = await this.firebaseService.queryDocuments(
        'comments',
        'messageId',
        '==',
        id
      );
      const comments = querySnapshot.docs.map((doc: any) => doc.data());
      const length = comments.length.toString();
      return length;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  openThread(message: any) {
    this.messageId = message.id;
    this.threads = [];
    this.threads.push(message);
    this.showComments(message.id);
    this.startRealTimeCommentUpdates(message.id);
  }

  async showComments(id: any) {
    try {
      const querySnapshot = await this.firebaseService.queryDocuments(
        'comments',
        'messageId',
        '==',
        id
      );
      this.comments = [];
      querySnapshot.forEach((doc: any) => {
        let commentData = doc.data();
        commentData['id'] = doc.id;
        this.comments.push(commentData);
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  toggleEmojiPicker(entityId: string, isThread: boolean) {
    if (isThread) {
      if (this.editEmojiThreadId === entityId) {
        this.editEmojiThreadId = null;
      } else {
        this.editEmojiThreadId = entityId;
      }
      this.editEmojiMessageId = null;
      this.editEmojiCommentId = null;
    } else {
      if (this.editEmojiMessageId === entityId) {
        this.editEmojiMessageId = null;
      } else {
        this.editEmojiMessageId = entityId;
      }
      this.editEmojiThreadId = null;
      this.editEmojiCommentId = null;
    }
  }

  isEmojiPickerOpen(entityId: string, isThread: boolean): boolean {
    if (isThread) {
      return this.editEmojiThreadId === entityId;
    } else {
      return this.editEmojiMessageId === entityId;
    }
  }

  async addEmojiToComment(event: any, commentId: string) {
    const reaction = new Reaction({
      fullName: this.loggedUser.fullName,
      userId: this.loggedUser.id,
      emoji: event.emoji.native,
    });

    const reactionJSON = reaction.toJSON();
    const docSnapshot = await this.firebaseService.getDocument(
      'comments',
      commentId
    );
    if (docSnapshot.exists()) {
      let existingReactions = docSnapshot.data()?.['reactions'] || [];
      await this.firebaseService.updateDocument('comments', commentId, {
        reactions: arrayUnion(reactionJSON, ...existingReactions),
      });
    } else {
      console.error('Document not found');
    }
  }

  setEditMode(message: any) {
    this.editMessageId = message.id;
    this.newText = message.text;
  }

  isEditMode(messageId: string): boolean {
    return this.editMessageId === messageId;
  }

  async updateMessage(message: any, mainMsg: string) {
    let txt;
    if (mainMsg == 'mainMsg') {
      txt = this.newText;
    } else {
      txt = this.editedComment;
    }
    const docSnapshot = await this.firebaseService.getDocument(
      'messages',
      message.id
    );

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('messages', message.id, {
        text: txt,
        edited: true,
      });
    }
    this.editMessageId = null;
    message.text = txt;
    this.editingCommentId = null;
  }

  addReactionToMainMessage(from: string) {
    this.active = !this.active;
  }

  setEmojiEditMode(messageId: string) {
    this.editEmojiMessageId = messageId;
  }

  async addEmojiToMessage(event: any, messageId: string) {
    const message = this.messages.find((message) => message.id === messageId);
    if (message) {
      try {
        const reaction = new Reaction({
          fullName: this.loggedUser.fullName,
          userId: this.loggedUser.id,
          emoji: event.emoji.native,
        });

        const reactionJSON = reaction.toJSON();
        const docSnapshot = await this.firebaseService.getDocument(
          'messages',
          messageId
        );
        if (docSnapshot.exists()) {
          let existingReactions = docSnapshot.data()?.['reactions'] || [];
          await this.firebaseService.updateDocument('messages', messageId, {
            reactions: arrayUnion(reactionJSON, ...existingReactions),
          });
        } else {
          console.error('Document not found');
        }
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
    this.editEmojiMessageId = null;
  }

  addMessage(channel: boolean, recipient: User) {
    const message = new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.loggedUser,
      recipient: recipient,
      isChannelMessage: channel,
      reactions: [],
    });

    this.firebaseService
      .addDocument('messages', message.toJSON())
      .then((data: any) => {
        this.searchMessages(recipient);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  async commentMessage(): Promise<void> {
    try {
      const comment = new Comment({
        text: this.commentText,
        timestamp: new Date(),
        creator: this.loggedUser,
        messageId: this.messageId,
        isChannelMessage: false,
        edited: false,
        reactions: [],
      });

      const commentJSON = comment.toJSON();
      await this.firebaseService.addDocument('comments', commentJSON);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }
}
