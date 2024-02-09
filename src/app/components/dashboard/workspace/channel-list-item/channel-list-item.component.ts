import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../../services/chat-navigation.service';
import { log } from 'console';
@Component({
  selector: 'app-channel-list-item',
  standalone: true,
  imports: [HoverChangeDirective, RouterModule],
  templateUrl: './channel-list-item.component.html',
  styleUrl: './channel-list-item.component.scss',
})
export class ChannelListItemComponent implements OnInit {
  @Input() channels: any = []; //workaround due to typing-errors (NG0 Type '' is missing the following properties from type: length, pop, push ANGULAR )
  // @Input() channels!: Array<{ name: string }>;
  @Input() user!: {
    channels: Array<{ name: string }>;
    // directMessages: Array<any>;
  };

  // ************* directing event as boolean to grandparent (/dashboard) through parent(/workspace)
  openChannelChat!: boolean;
  @Output() openChatChannel = new EventEmitter<boolean>();

  constructor(private router: Router,
    private navService: chatNavigationService
    ) {}

  ngOnInit(): void {
    console.log(this.channels);
  }

  displayChannel(channels: any[]) {
    this.navService.openChannel(channels);
    // this.openChannelChat = true;
    // this.openChatChannel.emit(this.openChannelChat);
  }
}
