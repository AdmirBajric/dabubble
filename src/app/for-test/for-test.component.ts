import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ProfileViewComponent } from '../components/profile/profile-view/profile-view.component';
import { ChannelEditComponent } from '../components/chat/channel/channel-edit/channel-edit.component';
import { CreateChannelComponent } from '../components/shared/dialogs/create-channel/create-channel.component';
import { MessageComponent } from "../components/chat/message/message.component";
import { Message, Reaction, Room } from '../models/collection.class';
import { User } from '../models/user.class';
import { SearchbarComponent } from "../components/shared/searchbar/searchbar.component";
import { MessageInputComponent } from "../message-input/message-input.component";

@Component({
    selector: 'app-for-test',
    standalone: true,
    templateUrl: './for-test.component.html',
    styleUrl: './for-test.component.scss',
    imports: [
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule,
        MatCardModule,
        CommonModule,
        RouterLink,
        MessageComponent,
        SearchbarComponent,
        MessageInputComponent
    ]
})
export class ForTestComponent {
  constructor(public dialog: MatDialog) {}

  messages :any[] = [
  {
    sender: {
      fullName: 'Admir Bajric',
      email: "",
      password: "",
      avatar: '../../assets/img/avatar1.svg',
      isOnline: true,
      },

    message: "Hallo ich bin eine testnachricht",
    receiver: {
      fullName: 'Julius Marecek',
      email: "",
      password: "",
      avatar: '../../assets/img/avatar1.svg',
      isOnline: true,
      },

    created_at: "2024-01-12T10:00:00",
    room: "",
    answers: [{
      sender: {
        fullName: 'Admir Bajric',
        email: "",
        password: "",
        avatar: '../../assets/img/avatar1.svg',
        isOnline: true,
        },
        message: "Hallo ich bin eine testnachricht",
        created_at: "2024-01-12T10:00:00",
        reaction: [{}],
    }],
    reaction: [{}],
    },
    {
      sender: {
        fullName: 'Julius Marecek',
        email: "",
        password: "",
        avatar: '../../assets/img/avatar1.svg',
        isOnline: true,
        },
  
      message: "Hallo ich bin eine testnachricht",
      receiver: {
        fullName: 'Admir Bajric',
        email: "",
        password: "",
        avatar: '../../assets/img/avatar1.svg',
        isOnline: true,
        },
  
      created_at: "2024-01-12T10:00:00",
      room: "",
      answers: [{
        sender: {
          fullName: 'Julius Marecek',
          email: "",
          password: "",
          avatar: '../../assets/img/avatar1.svg',
          isOnline: true,
          },
          message: "Hallo ich bin eine testnachricht",
          created_at: "2024-01-12T10:00:00",
          reaction: [{}],
      }],
      reaction: [{}],
      },
  ];

  openDialog() {
    this.dialog.open(ProfileViewComponent);
  }

  openChannelDialog() {
    this.dialog.open(ChannelEditComponent, {
      autoFocus: false,
    });
  }

  openCreateChannel() {
    this.dialog.open(CreateChannelComponent, {
      autoFocus: false,
    });
  }
}
