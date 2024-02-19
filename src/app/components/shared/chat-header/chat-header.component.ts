import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from '../../../services/button-function.service';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { MatDialog } from '@angular/material/dialog';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Channel } from '../../../models/channel.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [ChannelEditComponent, CommonModule, HoverChangeDirective],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
})
export class ChatHeaderComponent implements OnInit, OnDestroy {
  @Input() styleHeaderForThread: boolean = false;
  @Output() closeThread: EventEmitter<any[]> = new EventEmitter<any[]>();
  currentChannel: Channel | null = null;
  channelSubscription: Subscription | undefined;
  channelsSubscription: Subscription | undefined;

  constructor(
    private btnService: ButtonFunctionService,
    private dialog: MatDialog,
    private navService: chatNavigationService
  ) {}

  ngOnInit() {
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

  get countMembersRoom(): number {
    return this.currentChannel ? this.currentChannel.members.length : 0;
  }

  showMembers(channel: Channel) {
    this.btnService.showChannelMembers(channel);
  }

  addMember(channel: Channel) {
    this.btnService.addMemberDialog(channel);
  }

  getLeftPositioning(i: number): string {
    return `${3 * i}rem`;
  }

  openEditChannel() {
    this.btnService.openChannelDialog();
  }

  exitThread() {
    this.navService.closeThread();
  }
}
