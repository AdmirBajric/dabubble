import { Component } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emojis',
  standalone: true,
  imports: [PickerComponent],
  templateUrl: './emojis.component.html',
  styleUrl: './emojis.component.scss',
})
export class EmojisComponent {
  addEmoji(event: any): void {
    console.log(event.emoji);
  }
}
