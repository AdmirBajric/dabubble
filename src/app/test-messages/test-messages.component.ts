import { Component, OnInit } from '@angular/core';
import { Message, Comment, Reaction } from '../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatIconModule } from '@angular/material/icon';
import { arrayUnion } from '@angular/fire/firestore';
import { FirebaseService } from '../services/firebase.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PickerComponent,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './test-messages.component.html',
  styleUrls: ['./test-messages.component.scss'],
})
export class TestMessagesComponent implements OnInit {
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

  form: FormGroup;
  usersSearch: boolean = false;
  channelSearch: boolean = false;
  users: { fullName: string; avatar: string }[] = [
    {
      fullName: 'John Doe',
      avatar:
        'https://gruppe-873.developerakademie.net/angular-projects/dabubble/assets/img/avatar3.svg',
    },
  ];
  channels: { channelName: string }[] = [{ channelName: 'General' }];

  constructor(
    private firebaseService: FirebaseService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      userInput: [''],
    });

    const inputControl = this.form.get('userInput');
    if (inputControl) {
      inputControl.valueChanges.subscribe((value) => {
        this.text = value;

        if (value === '@') {
          this.usersSearch = true;
        } else {
          this.usersSearch = false;
        }

        if (value === '#') {
          this.channelSearch = true;
        } else {
          this.channelSearch = false;
        }
      });
    }
  }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  async updateMessage(id: string) {
    const docSnapshot = await this.firebaseService.getDocument('messages', id);

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('messages', id, {
        text: this.editedMessage,
        edited: true,
      });
    }

    this.editContainerOpen = false;
    this.showMessage();
  }

  async updateComment(id: string) {
    const docSnapshot = await this.firebaseService.getDocument('comments', id);

    if (docSnapshot.exists()) {
      await this.firebaseService.updateDocument('comments', id, {
        text: this.editedComment,
        edited: true,
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

  addMessage(channel: boolean) {
    const message = new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.user,
      channelId: '8dGv7CQvxfHJhcH1vyiw',
      isChannelMessage: channel,
      reactions: [],
    });

    console.log(message.toJSON());

    this.firebaseService
      .addDocument('messages', message.toJSON())
      .then((data: any) => {
        this.messageId = data.id;
      })
      .catch((err: any) => {
        console.log(err);
      });

    this.showMessage();
  }

  // Shows the message that was created
  async showMessage() {
    setTimeout(async () => {
      try {
        const docSnapshot = await this.firebaseService.getDocument(
          'messages',
          this.messageId
        );
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
  async addEmoji(
    event: any,
    StringOrId: string,
    isMainMessage: boolean
  ): Promise<void> {
    this.activeCommentId = null;

    try {
      const reaction = new Reaction({
        fullName: this.user.fullName,
        userId: this.user.id,
        emoji: event.emoji.native,
      });

      const reactionJSON = reaction.toJSON();

      if (isMainMessage) {
        const docSnapshot = await this.firebaseService.getDocument(
          'messages',
          this.messageId
        );
        if (docSnapshot.exists()) {
          await this.firebaseService.updateDocument(
            'messages',
            this.messageId,
            {
              reactions: [reactionJSON], // Overwrite existing reactions with the new one
            }
          );
          this.showReactionOnMainChannel();
        } else {
          console.error('Document not found');
        }
      } else {
        await this.saveReactionComments(reactionJSON, StringOrId);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  // Show reaction Channel main message
  async showReactionOnMainChannel() {
    const docSnapshot = await this.firebaseService.getDocument(
      'messages',
      this.messageId
    );

    if (docSnapshot.exists()) {
      const existingReactions = docSnapshot.data()?.['reactions'] || [];
      this.emojis = [];
      existingReactions.forEach((reaction: any) => {
        this.emojis.push(reaction.emoji);
      });
      this.active = false;
    }
  }

  // Save reaction on the comments
  async saveReactionComments(
    reactionJSON: any,
    StringOrId: string
  ): Promise<void> {
    try {
      const docSnapshot = await this.firebaseService.getDocument(
        'comments',
        StringOrId
      );
      if (docSnapshot.exists()) {
        await this.firebaseService.updateDocument('comments', StringOrId, {
          reactions: [reactionJSON], // Overwrite existing reactions with the new one
        });
        this.showComments(); // Refresh comments after saving reaction
      } else {
        console.error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
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
        isChannelMessage: true,
        edited: false,
        reactions: [],
      });

      const commentJSON = comment.toJSON();

      await this.firebaseService.addDocument('comments', commentJSON);

      this.showComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  // Shows Comments
  async showComments() {
    const querySnapshot = await this.firebaseService.queryDocuments(
      'comments',
      'messageId',
      '==',
      this.messageId
    );
    this.comments = [];
    querySnapshot.forEach((doc: any) => {
      let commentData = doc.data();
      commentData['id'] = doc.id;
      this.comments.push(commentData);
      this.editedComment = commentData['text'];
    });
  }
}
