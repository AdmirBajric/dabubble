import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-direct-message-list-item',
  standalone: true,
  imports: [],
  templateUrl: './direct-message-list-item.component.html',
  styleUrl: './direct-message-list-item.component.scss',
})
export class DirectMessageListItemComponent implements OnInit {
  @Input() user: any = [];

  constructor() {}

  ngOnInit(): void {
    console.log(this.user);
  }
}
