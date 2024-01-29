import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  @Input() roomName!: string;

  ngOnInit(){

  }
}
