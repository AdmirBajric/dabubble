import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-message-hover-actions',
  standalone: true,
  imports: [HoverChangeDirective, MatTooltipModule, NgIf],
  templateUrl: './message-hover-actions.component.html',
  styleUrl: './message-hover-actions.component.scss'
})
export class MessageHoverActionsComponent {
  @Input() isYou!: boolean;
  @Input() currentMessage!: Message[];
  // @Output() editMessage = new EventEmitter<Message>();
  @Output() editMessage: EventEmitter<boolean> = new EventEmitter<boolean>();
  messageEditing!: boolean;
  showToolTip: boolean = false;

  constructor(private navService: chatNavigationService) {

  }

  ngOnInit() {
  }

  openEditMessage($event: MouseEvent) {
    $event.stopPropagation();
    this.handlingTooltip();
    this.messageEditing = true;
    this.editMessage.emit(this.messageEditing);
  }

  handlingTooltip() {
    this.showToolTip = false;
  }

  openThread(){
    this.navService.openThread(this.currentMessage);
  }

}
