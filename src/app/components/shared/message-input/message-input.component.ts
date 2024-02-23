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
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent implements OnInit {
  currentChannel: Channel | null = null;
  channelSubscription!: Subscription;
  channelsSubscription!: Subscription;
  // can be used in 'directMessages', 'channel', 'thread'
  @Input() usedLocation!: string;
  @Output() commentData = new EventEmitter<{
    commentText: string;
    commentFile: string;
  }>();
  placeholder: string = 'Nachricht an #Entwicklerteam';
  text: string = '';
  form!: FormGroup;
  uploadedFile: string = '';
  user!: any;
  messageId: string = '';
  selectedFile: File | null = null;
  previewImageUrl: any;

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
            // Reset uploadedFile if no image was selected
            if (this.selectedFile === null) {
              this.uploadedFile = '';
            }
          })
          .catch((err: any) => {
            console.log(err);
          });
      }

  async prepareData() {
    const channel = this.checkIfChannel();
    await this.uploadImage(); // saves file within local variable
    if (this.text.length > 0) {
      if (channel) {
        const message = this.packMessageData(channel);
        const messageToJson = message.toJSON();
        this.sendMessage(messageToJson);
      } else if (this.usedLocation === 'thread') {
        const commentText = this.text;
        const commentFile = this.uploadedFile;
        this.commentData.emit({ commentText, commentFile })
      }
      this.text = '';
    }
  }

  sendMessage(messageToJson: Message) {
    this.firebaseService
      .addDocument('messages', messageToJson)
      .then((data: any) => {
        this.messageId = data.id;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  packMessageData(channel: boolean) {
    return new Message({
      text: this.text,
      timestamp: new Date(),
      creator: this.user,
      channelId: this.currentChannel?.id,
      isChannelMessage: channel,
      reactions: [],
      file: this.uploadedFile,
    });
  }


  checkIfChannel() {
    if (this.usedLocation === 'channel') {
      return true;
    } else {
      return false;

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
