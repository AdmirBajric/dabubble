import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../chat/message/message.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { LogoComponent } from '../shared/logo/logo.component';
import { SearchbarComponent } from '../shared/searchbar/searchbar.component';
import { ThreadComponent } from '../chat/thread/thread.component';
import { ButtonWorkspaceComponent } from './button-workspace/button-workspace.component';
import { MessageInputComponent } from '../shared/message-input/message-input.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ChatHeaderComponent } from '../shared/chat-header/chat-header.component';
import { MainChatComponent } from '../chat/main-chat/main-chat.component';
import { NewMessageComponent } from '../chat/main-chat/new-message/new-message.component';
import { chatNavigationService } from '../../services/chat-navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    CommonModule,
    WorkspaceComponent,
    MessageComponent,
    LogoComponent,
    SearchbarComponent,
    ThreadComponent,
    ButtonWorkspaceComponent,
    MessageInputComponent,
    ProfileMenuComponent,
    ChatHeaderComponent,
    MainChatComponent,
    NewMessageComponent,
  ],
})
export class DashboardComponent implements OnInit {
  workspaceIsOpen: boolean = true;
  threadIsOpen: boolean = false;
  gridAreaRegulation: string = 'nct';
  selectedMessageForThread: any[] = [];
  selectedRoomName: string = 'Entwicklerteam';
  activateThreadHeader: boolean = true; // must be set to true, because the default grid style shows all 3 main components of dashboard
  showMessages: boolean = true; // default
  writeNewMessage: boolean = false; // default

  private threadStatusSubscription!: Subscription;

  constructor(private navService: chatNavigationService) {}
  ngOnInit(): void {
    this.handleGridAreaToggle();
    this.subscribeToThreadStatus();
  }

  subscribeToThreadStatus() {
    this.threadStatusSubscription = this.navService.threadStatus$.subscribe(
      (value) => {
        this.threadIsOpen = value;
        this.handleGridAreaToggle();
      }
    );
  }

  handleWorkspaceToggle(isOpen: boolean) {
    // console.log(isOpen);
    this.workspaceIsOpen = isOpen;
    this.handleGridAreaToggle();
  }

  handleGridAreaToggle() {
    if (this.workspaceIsOpen && this.threadIsOpen === true) {
      this.gridAreaRegulation = 'nct';
      // console.log(this.gridAreaRegulation);
    } else if (!this.workspaceIsOpen && this.threadIsOpen) {
      this.gridAreaRegulation = 'cct';
      // console.log(this.gridAreaRegulation);
    } else if (!this.workspaceIsOpen && !this.threadIsOpen) {
      this.gridAreaRegulation = 'ccc';
    } else if (this.workspaceIsOpen && !this.threadIsOpen) {
      this.gridAreaRegulation = 'ncc';
    }
  }

  openNewMessage() {
    // toggling does not help because it's a one way way
    this.showMessages = false;
    this.writeNewMessage = true;
  }

  openChatofChannel() {
    // we need to get id of channel, so the correct content can be displayed
    this.showMessages = true;
    this.writeNewMessage = false;
  }

  ngOnDestroy() {
    this.threadStatusSubscription.unsubscribe();
  }

  // messages: any[] = [
  //     {
  //         sender: {
  //             fullName: 'Admir Bajric',
  //             email: "",
  //             password: "",
  //             avatar: '../../assets/img/avatar1.svg',
  //             isOnline: true,
  //         },

  //         message: "Hallo ich bin die erste testnachricht",
  //         receiver: {
  //             fullName: 'Julius Marecek',
  //             email: "",
  //             password: "",
  //             avatar: '../../assets/img/avatar1.svg',
  //             isOnline: true,
  //         },

  //         created_at: "2024-01-12T10:00:00",
  //         room: "",
  //         answers: [{
  //             sender: {
  //                 fullName: 'Julius Marecek',
  //                 email: "",
  //                 password: "",
  //                 avatar: '../../assets/img/avatar1.svg',
  //                 isOnline: true,
  //             },
  //             message: "Hallo ich bin die Antwort auf deine erste testnachricht",
  //             created_at: "2024-01-12T10:01:00",
  //             reaction: [{}],
  //         }],
  //         reaction: [{}],
  //     },
  //     {
  //         sender: {
  //             fullName: 'Julius Marecek',
  //             email: "",
  //             password: "",
  //             avatar: '../../assets/img/avatar1.svg',
  //             isOnline: true,
  //         },

  //         message: "Hallo ich bin eine zweite testnachricht an Admir",
  //         receiver: {
  //             fullName: 'Admir Bajric',
  //             email: "",
  //             password: "",
  //             avatar: '../../assets/img/avatar1.svg',
  //             isOnline: true,
  //         },

  //         created_at: "2024-01-12T10:02:00",
  //         room: "",
  //         answers: [{
  //             sender: {
  //                 fullName: 'Julius Marecek',
  //                 email: "",
  //                 password: "",
  //                 avatar: '../../assets/img/avatar1.svg',
  //                 isOnline: true,
  //             },
  //             message: "Hallo ich bin die Antwort auf deine zweite testnachricht",
  //             created_at: "2024-01-12T10:03:00",
  //             reaction: [{}],
  //         }],
  //         reaction: [{}],
  //     },
  // ];
}
