import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WorkspaceHeaderComponent } from './workspace-header/workspace-header.component';
import { ChannelListItemComponent } from './channel-list-item/channel-list-item.component';
import { DirectMessageListItemComponent } from './direct-message-list-item/direct-message-list-item.component';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { EventEmitter } from '@angular/core';
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
  showChannels: boolean = false;
  showDMs: boolean = true;
  screenWidth: number = 0;
  imageFlag!: string;
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

  // ########DUMMY#################DUMMY#################DUMMY######### ########DATA################
  // ########DUMMY#################DUMMY#################DUMMY######### ########DATA################

  user!: {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: number;
    bio: string;
    profile_pic: number;
    channels: Array<{ name: string }>;
    directMessages: Array<any>;
  };
  channels!: Array<{ name: string }>;

  ngOnInit() {
    this.user = {
      userName: 'Herbert Winter',
      password: 'XOXOXO',
      firstName: 'Herbert',
      lastName: 'Winter',
      email: 'winter@test.de',
      birthDate: 29051992,
      bio: 'hello world!',
      profile_pic: 12,

      channels: [
        {
          name: 'Entwicklerteam',
        },
        {
          name: 'Marketing',
        },
        {
          name: 'Vertrieb',
        },
      ],

      directMessages: [
        {
          withUser: {
            firstName: 'Carlos',
            lastName: 'Garcia',
            imageUrl: './../../assets/img/avatar2.svg',
          },
          messageHistory: [
            {
              sender: 'Carlos Garcia',
              message: '¿Cómo estás hoy?',
              receiver: this.user,
              timestamp: '2024-01-18T10:00:00',
            },
            {
              sender: this.user,
              message: 'Estoy bien, gracias.',
              receiver: 'Carlos Garcia',
              timestamp: '2024-01-18T10:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Marie',
            lastName: 'Dubois',
            imageUrl: './../../assets/img/avatar3.svg',
          },
          messageHistory: [
            {
              sender: 'Marie Dubois',
              message: 'Salut, comment ça va?',
              receiver: this.user,
              timestamp: '2024-01-18T11:00:00',
            },
            {
              sender: this.user,
              message: 'Ça va bien, merci.',
              receiver: 'Marie Dubois',
              timestamp: '2024-01-18T11:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Yukio',
            lastName: 'Tanaka',
            imageUrl: './../../assets/img/avatar4.svg',
          },
          messageHistory: [
            {
              sender: 'Yukio Tanaka',
              message: 'こんにちは、お元気ですか？',
              receiver: this.user,
              timestamp: '2024-01-18T12:00:00',
            },
            {
              sender: this.user,
              message: 'はい、元気です。ありがとう！',
              receiver: 'Yukio Tanaka',
              timestamp: '2024-01-18T12:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Emma',
            lastName: 'Smith',
            imageUrl: './../../assets/img/avatar5.svg',
          },
          messageHistory: [
            {
              sender: 'Emma Smith',
              message: "Hey, how's your day going?",
              receiver: this.user,
              timestamp: '2024-01-18T13:00:00',
            },
            {
              sender: this.user,
              message: "It's going great, thanks!",
              receiver: 'Emma Smith',
              timestamp: '2024-01-18T13:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Aisha',
            lastName: 'Patel',
            imageUrl: './../../assets/img/avatar1.svg',
          },
          messageHistory: [
            {
              sender: 'Aisha Patel',
              message: 'Hi, how are you?',
              receiver: this.user,
              timestamp: '2024-01-18T09:00:00',
            },
            {
              sender: this.user,
              message: "I'm doing well, thanks!",
              receiver: 'Aisha Patel',
              timestamp: '2024-01-18T09:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Alex',
            lastName: 'Schmidt',
            imageUrl: './../../assets/img/avatar2.svg',
          },
          messageHistory: [
            {
              sender: 'Alex Schmidt',
              message: "Hallo, wie geht's?",
              receiver: this.user,
              timestamp: '2024-01-18T09:00:00',
            },
            {
              sender: this.user,
              message: "Mir geht's auch gut!",
              receiver: 'Alex Schmidt',
              timestamp: '2024-01-18T09:05:00',
            },
          ],
        },
        {
          withUser: {
            firstName: 'Daniele',
            lastName: 'Meyer',
            imageUrl: './../../assets/img/avatar3.svg',
          },
          messageHistory: [
            {
              sender: 'Daniele Meyer',
              message: "Hallo, wie geht's?",
              receiver: this.user,
              timestamp: '2024-01-18T09:00:00',
            },
            {
              sender: this.user,
              message: "Mir geht's gut, danke!",
              receiver: 'Daniele Meyer',
              timestamp: '2024-01-18T09:05:00',
            },
          ],
        },
      ],
    };

    this.channels = this.user.channels;
  }
}
