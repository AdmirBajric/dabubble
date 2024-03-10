import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-input',
  standalone: true,
  imports: [MatIconModule, NgIf, FormsModule],
  templateUrl: './dialog-input.component.html',
  styleUrl: './dialog-input.component.scss',
})
export class DialogInputComponent {
  @Input() placeholder: string = '';

  @Input() value: string = '';

  @Input() Tag!: Boolean;

  @ViewChild('inputField') inputField!: ElementRef;

  @Output() focusEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() valueChanged: EventEmitter<string> = new EventEmitter<string>();

  onFocus(): void {
    this.focusEvent.emit();
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChanged.emit(value);
  }
}
