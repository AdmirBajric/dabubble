import { Component, OnInit, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Message, Comment, Reaction } from '../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatIconModule } from '@angular/material/icon';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-test-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent, MatIconModule],
  templateUrl: './test-messages.component.html',
  styleUrl: './test-messages.component.scss',
})
export class TestMessagesComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  collection = collection(this.firestore, 'messages');
  user!: any;
  text: string = '';
  textFromServer: string = '';
  editedMessage: string = '';
  editedComment: string = '';
  active: boolean = false;
  activeComment: boolean = false;
  comment: string = '';
  messageId: string = '';
  commentId: string = '';
  emojis: string[] = [];
  comments: any[] = [];
  activeCommentId: string | null = null;
  editContainerOpen: boolean = false;
  editMessageBtnShow: boolean = false;
  editCommentContainerShow: boolean = false;

  constructor() {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  async updateMessage(id: string) {
    const documentRef = doc(collection(this.firestore, 'messages'), id);
    const docSnapshot = await getDoc(documentRef);

    if (docSnapshot.exists()) {
      await updateDoc(documentRef, {
        text: this.editedMessage,
      });
    }

    this.editContainerOpen = false;
    this.showMessage();
  }

  async updateComment(id: string) {
    const documentRef = doc(collection(this.firestore, 'comments'), id);
    const docSnapshot = await getDoc(documentRef);

    if (docSnapshot.exists()) {
      await updateDoc(documentRef, {
        text: this.editedComment,
      });
    }

    this.editCommentContainerShow = false;
    this.showComments();
  }

  editCommentOpenContainer() {
    this.editCommentContainerShow = true;
  }

  closeEditContainer() {
    this.editContainerOpen = false;
  }

  showEditContainer() {
    this.editContainerOpen = true;
  }

  // Create new message on Channel
  addMessage() {
    const message = new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.user,
      channelId: '8dGv7CQvxfHJhcH1vyiw',
      reactions: [],
      comments: [],
    });

    const messageJSON = message.toJSON();

    this.showMessage();

    addDoc(this.collection, messageJSON)
      .then((data) => {
        this.messageId = data.id;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Shows the message that was created
  async showMessage() {
    setTimeout(async () => {
      try {
        const documentRef = doc(
          collection(this.firestore, 'messages'),
          this.messageId
        );
        const docSnapshot = await getDoc(documentRef);
        if (docSnapshot.exists()) {
          const documentData = docSnapshot.data();
          this.textFromServer = documentData['text'];
          this.editedMessage = documentData['text'];
          this.editMessageBtnShow = true;
        } else {
          console.error('Document not found');
        }
      } catch (error) {
        console.error('Error getting document data:', error);
      }
    }, 1500);
  }

  // Opens the emoji container
  addReactionToMainMessage(from: string) {
    if (from === 'mainMessage') {
      this.active = !this.active;
    } else {
      this.activeComment = !this.activeComment;
    }
  }

  setActiveComment(commentId: string) {
    this.activeCommentId =
      this.activeCommentId === commentId ? null : commentId;
  }

  // Add emoji to the main message on Channel
  async addEmoji(event: any, from: string): Promise<void> {
    this.activeCommentId = null;

    try {
      const reaction = new Reaction({
        fullName: this.user.fullName,
        userId: this.user.id,
        emoji: event.emoji.native,
      });

      const reactionJSON = reaction.toJSON();
      const documentRef = doc(
        collection(this.firestore, 'messages'),
        this.messageId
      );
      const docSnapshot = await getDoc(documentRef);
      if (docSnapshot.exists()) {
        if (from === 'mainMessage') {
          let existingReactions = docSnapshot.data()?.['reactions'] || [];
          await updateDoc(documentRef, {
            reactions: arrayUnion(reactionJSON, ...existingReactions),
          });
          this.showReactionOnMainChannel();
        } else {
          this.saveReactionComments(reactionJSON, from);
        }
      } else {
        console.error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  async saveReactionComments(reactionJSON: any, from: string): Promise<void> {
    // from is ID
    const documentRef = doc(collection(this.firestore, 'comments'), from);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      let existingReactions = docSnapshot.data()?.['reactions'] || [];
      await updateDoc(documentRef, {
        reactions: arrayUnion(reactionJSON, ...existingReactions),
      });
      this.showComments();
    } else {
      console.error('Document not found');
    }
  }

  // Show reaction Channel main message
  async showReactionOnMainChannel() {
    const documentRef = doc(
      collection(this.firestore, 'messages'),
      this.messageId
    );
    const docSnapshot = await getDoc(documentRef);

    if (docSnapshot.exists()) {
      const existingReactions = docSnapshot.data()?.['reactions'] || [];
      this.emojis = [];
      existingReactions.forEach((reaction: any) => {
        this.emojis.push(reaction.emoji);
      });
      this.active = false;
    }
  }

  // Add Comment on the main message on Channel
  async commentMessage(): Promise<void> {
    try {
      const comment = new Comment({
        text: this.comment,
        timestamp: new Date(),
        creator: this.user,
        messageId: this.messageId,
        reactions: [],
      });

      const commentJSON = comment.toJSON();
      const commentCollection = collection(this.firestore, 'comments');

      addDoc(commentCollection, commentJSON)
        .then((data) => {
          this.commentId = data.id;
        })
        .catch((err) => {});

      this.showComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  // Shows Comments
  async showComments() {
    const commentsRef = collection(this.firestore, 'comments');
    const queryRef = query(
      commentsRef,
      where('messageId', '==', this.messageId)
    );

    const querySnapshot = await getDocs(queryRef);
    this.comments = [];
    querySnapshot.forEach((doc) => {
      let commentData = doc.data();
      commentData['id'] = doc.id;
      this.comments.push(commentData);
      this.editedComment = commentData['text'];
    });
  }
}
