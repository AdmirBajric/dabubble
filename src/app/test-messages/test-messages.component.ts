import { Component, OnInit, inject } from '@angular/core';
import { Message, Comment, Reaction } from '../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseService } from '../services/firebase.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { getAuth, signOut } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

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

  form!: FormGroup;
  usersSearch: boolean = false;
  channelSearch: boolean = false;
  users: any[] = [];
  channels: any[] = [];
  showUserInput: string[] = [];
  isUserInput: boolean = false;
  imgSelected: boolean = false;
  selectedFile: File | null = null;
  downloadURL: string | null = null;
  previewImageUrl: any;
  hidePersonImg: boolean = false;
  personImg = '../../assets/img/person.svg';
  uploadedFile: string = '';
  img: string = '';

  firestore: Firestore = inject(Firestore);

  constructor(
    private firebaseService: FirebaseService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.setInputControl();
    this.setUserAndChannels();
  }

  setUserAndChannels() {
    this.firebaseService
      .getAllUsers()
      .then((users: any[]) => {
        this.users = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

    this.firebaseService
      .getAllChannels()
      .then((channels: any[]) => {
        this.channels = channels;
      })
      .catch((error) => {
        console.error('Error fetching channels:', error);
      });
  }

  addUser(userId: any) {
    const selectedUserIndex = this.users.findIndex(
      (user) => user.id === userId
    );
    if (selectedUserIndex !== -1) {
      const selectedUser = this.users.splice(selectedUserIndex, 1)[0];
      this.showUserInput.push('@' + selectedUser.fullName);
      this.form.get('userInput')?.setValue(this.showUserInput.join(' ') + ' ');
      this.usersSearch = false;
      this.setFocusToInput();
    }
  }

  addChannel(channelName: string) {
    const selectedChannelIndex = this.channels.find(
      (channel) => channel.name === channelName
    );

    if (selectedChannelIndex.name !== -1) {
      const selectedChannel = this.channels.splice(
        selectedChannelIndex.name,
        1
      )[0];
      this.showUserInput.push('#' + selectedChannel.name);
      this.form.get('userInput')?.setValue(this.showUserInput.join(' ') + ' ');
      this.channelSearch = false;
      this.setFocusToInput();
    }
  }

  setFocusToInput() {
    const inputElement = document.getElementById(
      'userInput'
    ) as HTMLInputElement;
    if (inputElement) {
      if (this.showUserInput.length > 0) {
        this.showUserInput.push(' ');
      }
      inputElement.focus();
    }
  }

  setInputControl() {
    this.form = this.formBuilder.group({
      userInput: [''],
    });
    const inputControl = this.form.get('userInput');
    if (inputControl) {
      inputControl.valueChanges.subscribe((value) => {
        this.text = value;

        const values = value.split(' ');

        values.forEach((value: string) => {
          if (value === '@' && this.users.length > 0) {
            this.usersSearch = true;
          } else {
            this.usersSearch = false;
          }

          if (value === '#' && this.channels.length > 0) {
            this.channelSearch = true;
          } else {
            this.channelSearch = false;
          }
        });
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

  async addMessage(channel: boolean) {
    await this.uploadImage();

    const message = new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.user,
      channelId: '8dGv7CQvxfHJhcH1vyiw',
      isChannelMessage: channel,
      reactions: [],
      file: this.uploadedFile,
    });

    const messageToJson = message.toJSON();

    this.firebaseService
      .addDocument('messages', messageToJson)
      .then((data: any) => {
        this.messageId = data.id;
        this.form.get('userInput')?.setValue('');
        this.showUserInput = [];
      })
      .catch((err: any) => {
        console.log(err);
      });

    this.showMessage();
  }

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
          this.img = documentData['file'];
          this.editMessageBtnShow = true;
        } else {
          console.error('Document not found');
        }
      } catch (error) {
        console.error('Error getting document data:', error);
      }
    }, 1500);
  }

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
              reactions: [reactionJSON],
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
          reactions: [reactionJSON],
        });
        this.showComments();
      } else {
        console.error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadImage() {
    if (this.selectedFile !== null) {
      const filename = this.user.id + '_' + this.selectedFile.name;
      const firebaseApp = getApp();
      const storage = getStorage(
        firebaseApp,
        'gs://dabubble-cee4e.appspot.com'
      );
      const storageRef = ref(storage, 'images/' + filename);
      await uploadBytes(storageRef, this.selectedFile)
        .then(async (snapshot) => {
          this.uploadedFile = await getDownloadURL(storageRef);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  }
}
