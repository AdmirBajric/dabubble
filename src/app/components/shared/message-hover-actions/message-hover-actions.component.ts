import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Message {
  id: string;
  text: string;
}
@Component({
  selector: 'app-message-hover-actions',
  standalone: true,
  imports: [HoverChangeDirective, MatTooltipModule, NgIf],
  templateUrl: './message-hover-actions.component.html',
  styleUrl: './message-hover-actions.component.scss'
})
export class MessageHoverActionsComponent {
  @Input() isYou!: boolean;
  @Input() currentMessage!: Message;
  // @Output() editMessage = new EventEmitter<Message>();
  @Output() editMessage: EventEmitter<boolean> = new EventEmitter<boolean>();
  messageEditing!: boolean;
  showToolTip: boolean = false;

  ngOnInit() {
    console.log(this.currentMessage);
  }

  openEditMessage($event: MouseEvent) {
    $event.stopPropagation();
    this.handlingTooltip();
    this.messageEditing = true;
    this.editMessage.emit(this.messageEditing);
    // this.editMessage.emit(this.currentMessage);
  }

  handlingTooltip() {
    this.showToolTip = false;
  }

}
