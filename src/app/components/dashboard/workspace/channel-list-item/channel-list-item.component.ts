import { Component, Input } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { HoverChangeDirective } from "../../../../directives/hover-change.directive";
@Component({
  selector: 'app-channel-list-item',
  standalone: true,
  imports: [
    HoverChangeDirective,
    RouterModule
  ],
  templateUrl: './channel-list-item.component.html',
  styleUrl: './channel-list-item.component.scss'
})
export class ChannelListItemComponent {
  @Input() channels: any  = []; //workaround due to typing-errors (NG0 Type '' is missing the following properties from type: length, pop, push ANGULAR )
  // @Input() channels!: Array<{ name: string }>;
  @Input() user!: {
    channels: Array<{ name: string }>,
    // directMessages: Array<any>;
  };
  constructor(private router: Router){}
}
