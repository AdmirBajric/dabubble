import { Component, Input, OnInit } from '@angular/core';
import { chatNavigationService } from '../../../../services/chat-navigation.service';

@Component({
  selector: 'app-direct-message-list-item',
  standalone: true,
  imports: [],
  templateUrl: './direct-message-list-item.component.html',
  styleUrl: './direct-message-list-item.component.scss',
})
export class DirectMessageListItemComponent implements OnInit {
  @Input() user: any = [];

  constructor(private navService: chatNavigationService) {}

  ngOnInit(): void {}

  displayChannel(user: any[]) {
    this.navService.openChannel(user);
    // this.openChannelChat = true;
    // this.openChatChannel.emit(this.openChannelChat);
  }
}
