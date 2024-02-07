import { Component, Input } from '@angular/core';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-message-hover-actions',
  standalone: true,
  imports: [HoverChangeDirective, NgIf],
  templateUrl: './message-hover-actions.component.html',
  styleUrl: './message-hover-actions.component.scss'
})
export class MessageHoverActionsComponent {
  @Input() isYou!: boolean;
  @Input() currentMessage: any;

  ngOnInit(){
    console.log(this.currentMessage);
  }
}
