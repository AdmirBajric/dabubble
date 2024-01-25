import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import {NgIf, NgFor} from '@angular/common';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule, NgIf, NgFor],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  isOpened = true;

  @Input() emojiInput$: Subject<string> | undefined;
  @ViewChild("container") container: ElementRef<HTMLElement> | undefined;

  constructor() {
  }

  emojiSelected(event: any) {
    const selectedEmoji = event.emoji.native;
    this.emojiInput$?.next(selectedEmoji);
  }

  eventHandler = (event: Event) => {
    if (!this.container?.nativeElement.contains(event.target as Node)) {
      this.isOpened = false;
      window.removeEventListener("click", this.eventHandler);
    }
  };

  toggled() {
    if (!this.container) {
      return;
    }
    this.isOpened = !this.isOpened;
    if (this.isOpened) {
      window.addEventListener("click", this.eventHandler);
    } else {
      window.removeEventListener("click", this.eventHandler);
    }
  }
}
