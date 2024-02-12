import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { WorkspaceHeaderComponent } from './workspace-header/workspace-header.component';
import { ChannelListItemComponent } from './channel-list-item/channel-list-item.component';
import { DirectMessageListItemComponent } from './direct-message-list-item/direct-message-list-item.component';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { EventEmitter } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-workspace',
  standalone: true,
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  imports: [
    ChannelListItemComponent,
    CommonModule,
    DirectMessageListItemComponent,
    RouterModule,
    WorkspaceHeaderComponent,
    HoverChangeDirective,
  ],
})
export class WorkspaceComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  showChannels: boolean = false;
  showDMs: boolean = false;
  screenWidth: number = 0;
  imageFlag!: string;
  user: any[] = [];
  channels: any[] = [];
  channelId: string = '';
  @Input() isOpen: boolean = true;
  // ********************** redirecting input event as output boolean to parent component
  showChannelContent!: boolean;
  @Output() openChannelChat = new EventEmitter<boolean>();

  showNewChat!: boolean;
  @Output() openChatWriteNewMessage = new EventEmitter<boolean>();

  constructor(
    private el: ElementRef,
    private btnService: ButtonFunctionService,
    private renderer: Renderer2
  ) {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  ngOnInit() {
    try {
      const itemCollection = collection(this.firestore, 'channels');
      onSnapshot(itemCollection, (querySnapshot) => {
        this.channels = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data['id'] = doc.id;
          this.channels.push(data);
        });
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
    this.showUser();
  }

  // Zum testen
  showUser() {
    const users = [
      {
        fullName: 'Admir Bajric',
        avatar:
          'https://gruppe-873.developerakademie.net/angular-projects/dabubble/assets/img/avatar3.svg',
      },
    ];

    users.forEach((user) => {
      this.user.push(user);
    });
  }

  openCreateChannel() {
    this.btnService.openCreateChannel();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: Event): void {
    this.checkWindowSize();
    this.checkImageFlag();
  }

  private checkWindowSize(): void {
    this.screenWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
  }

  showNewMessage() {
    this.showNewChat = true;
    this.openChatWriteNewMessage.emit(this.showNewChat);
  }

  showChannelChat() {
    this.showChannelContent = true;
    this.openChannelChat.emit(this.showChannelContent);
  }

  // ############################# for STYLES #############################
  // ######################################################################

  get defaultImagePath() {
    return `./../../assets/img/add_${this.imageFlag}.svg`;
  }

  get hoverImagePath() {
    return `./../../assets/img/add_${this.imageFlag}_hover.svg`;
  }

  checkImageFlag() {
    if (this.screenWidth <= 1100) {
      this.imageFlag = 'mobile';
    } else {
      this.imageFlag = 'desktop';
    }
  }
}
