import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../../services/chat-navigation.service';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-channel-list-item',
  standalone: true,
  imports: [HoverChangeDirective, RouterModule],
  templateUrl: './channel-list-item.component.html',
  styleUrl: './channel-list-item.component.scss',
})
export class ChannelListItemComponent implements OnInit {
  @Input() channel: any = []; //workaround due to typing-errors (NG0 Type '' is missing the following properties from type: length, pop, push ANGULAR )
  @Input() user!: {
    channels: Array<{ name: string }>;
  };

  // ************* directing event as boolean to grandparent (/dashboard) through parent(/workspace)
  openChannelChat!: boolean;
  @Output() openChatChannel = new EventEmitter<boolean>();

  constructor(
    private navService: chatNavigationService
  ) {}

  ngOnInit(): void {}

  displayChannel(channel: Channel) {
    console.log(channel);
    
    this.navService.openChannel(channel);
  }
}
