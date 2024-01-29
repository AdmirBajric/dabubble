import { Component, Input, OnInit } from '@angular/core';
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from "../../../services/button-function.service";

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [ChannelEditComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  @Input() roomName!: string;

  constructor(private btnService: ButtonFunctionService,){
  }
  ngOnInit(){
  }

  openEditChannel(){
    this.btnService.openChannelDialog();
  }
}
