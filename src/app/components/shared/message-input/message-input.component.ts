import {
  Component,
  Output,
  OnInit,
  EventEmitter,
  inject,
  Input,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Message, Comment, Reaction } from '../../../models/message.class';
import { Firestore } from '@angular/fire/firestore';
import { getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Channel } from '../../../models/channel.class';
import { Subscription } from 'rxjs';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { MatDialog } from '@angular/material/dialog';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    FormsModule,
    HoverChangeDirective,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    PickerComponent,
    CommonModule,
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent implements OnInit {
  @Input() styleHeaderForThread: boolean = false;
  @Output() closeThread: EventEmitter<any[]> = new EventEmitter<any[]>();
  currentChannel: Channel | null = null;
  channelSubscription: Subscription | undefined;
  channelsSubscription: Subscription | undefined;

  @Output() messageText: EventEmitter<string> = new EventEmitter<string>();
  placeholder: string = 'Nachricht an #Entwicklerteam';
  text: string = '';
  textForFile: string = '';
  form!: FormGroup;
  uploadedFile: string = '';
  user!: any;
  messageId: string = '';
  selectedFile: File | null = null;
  previewImageUrl: any;
  showEmoji: boolean = false;
  emoji: string = '';

  firestore: Firestore = inject(Firestore);

  constructor(
    private firebaseService: FirebaseService,
    private formBuilder: FormBuilder,
    private router: Router,
    private btnService: ButtonFunctionService,
    private dialog: MatDialog,
    private navService: chatNavigationService
  ) {}

  ngOnInit(): void {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }

    this.subscribeChannel();
    this.subscribeChannels();
  }

  ngOnDestroy() {
    // Unsubscribe from the events to avoid memory leaks
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.channelsSubscription) {
      this.channelsSubscription.unsubscribe();
    }
  }

  addEmoji(event: any): void {
    this.emoji = event.emoji.native;
    this.showEmoji = false;
    this.text += this.emoji;
  }

  toggleEmojiContainer() {
    this.showEmoji = !this.showEmoji;
  }

  subscribeChannel() {
    this.channelSubscription = this.navService.currentChannel.subscribe(
      (channel) => {
        this.currentChannel = channel;
      }
    );
  }

  subscribeChannels() {
    this.channelsSubscription = this.navService.channelsUpdated$.subscribe(
      (channels) => {
        const id = this.currentChannel?.id;
        channels.forEach((channel) => {
          if (channel.id === id) {
            this.currentChannel = channel;
          }
        });
      }
    );
  }

  async addMessage(channel: boolean) {
    if (this.text.length > 0 || this.selectedFile !== null) {
      await this.uploadImage();

      if (this.text.length > 0) {
        const message = new Message({
          text: this.text,
          timestamp: new Date(),
          creator: this.user,
          channelId: this.currentChannel?.id,
          isChannelMessage: channel,
          reactions: [],
          file: this.uploadedFile,
        });

        const messageToJson = message.toJSON();

        this.firebaseService
          .addDocument('messages', messageToJson)
          .then((data: any) => {
            this.messageId = data.id;
            this.text = '';
            this.textForFile = '';
            if (this.selectedFile === null) {
              this.uploadedFile = '';
            }
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Set the text to indicate that a file has been added
      this.textForFile = 'File added';
    } else {
      // Set the text to indicate that no file has been added
      this.textForFile = 'No file selected';
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
          this.selectedFile = null;
          this.previewImageUrl = null;
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  }
}
