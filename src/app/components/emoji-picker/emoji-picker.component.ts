import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule, NgIf, NgFor],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
})
export class EmojiPickerComponent {
  isOpened = true;

  @Input() emojiInput$: Subject<string> | undefined;
  @ViewChild('container') container: ElementRef<HTMLElement> | undefined;

  /**
   * Handles the selection of an emoji from the emoji picker.
   * It extracts the selected emoji's native representation and emits it through the `emojiInput$` Subject, if it exists.
   * @param {any} event - event object from the emoji picker, containing the selected emoji data.
   */
  emojiSelected(event: any) {
    const selectedEmoji = event.emoji.native;
    this.emojiInput$?.next(selectedEmoji);
  }

  /**
   * Event handler for global click events when the emoji picker is toggled open.
   * It checks if the click occurred outside the emoji picker's container element and, if so, closes the picker and removes the event listener.
   * @param {Event} event - The global click event object.
   */
  eventHandler = (event: Event) => {
    if (!this.container?.nativeElement.contains(event.target as Node)) {
      this.isOpened = false;
      window.removeEventListener('click', this.eventHandler);
    }
  };

  /**
   * Toggles the visibility of the emoji picker.
   * It adds or removes a global click event listener based on the picker's visibility state to handle closing the picker when clicking outside of it.
   */
  toggled() {
    if (!this.container) {
      return;
    }
    this.isOpened = !this.isOpened;
    if (this.isOpened) {
      window.addEventListener('click', this.eventHandler);
    } else {
      window.removeEventListener('click', this.eventHandler);
    }
  }
}
