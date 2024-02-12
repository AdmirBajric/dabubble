import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-direct-message-list-item',
  standalone: true,
  imports: [],
  templateUrl: './direct-message-list-item.component.html',
  styleUrl: './direct-message-list-item.component.scss'
})
export class DirectMessageListItemComponent {
  @Input() user: any = [];
}
