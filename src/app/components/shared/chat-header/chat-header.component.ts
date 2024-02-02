import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from "../../../services/button-function.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [ChannelEditComponent, CommonModule, HoverChangeDirective],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  @Input() roomName!: string;
  @Input() styleHeaderForThread!: boolean;
  @Output() closeThread = new EventEmitter<any[]>();

  constructor(private btnService: ButtonFunctionService,) {
  }
  ngOnInit() {
  }

  openEditChannel() {
    this.btnService.openChannelDialog();
  }

  exitThread() {
    this.closeThread.emit();
  }
}