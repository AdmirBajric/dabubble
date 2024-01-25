import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  constructor(public router: Router) {}
  isInputActive: boolean = false;

  @Input() inputType: string = 'text';
  @Input() pattern: string = '';
  @Input() img: string = '';
  @Input() placeholder: string = '';
  @Input() additionalData: boolean = false;
  @Input() formControl: FormControl = new FormControl('', [
    Validators.required,
    this.patternValidator(),
  ]);

  @Output() validityChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  handleFocus() {
    this.isInputActive = true;
  }

  handleBlur() {
    this.isInputActive = false;
    this.formControl.markAsTouched();
    this.validityChanged.emit(this.formControl.valid);
  }

  handleInput() {
    this.validityChanged.emit(this.formControl.valid);
  }

  private patternValidator(): () => null | { [key: string]: any } {
    return () => {
      if (this.formControl) {
        const controlValue = this.formControl.value;

        if (controlValue !== null && controlValue !== undefined) {
          const isValid = this.validatePattern(controlValue);
          return isValid ? null : { pattern: true };
        }
      }

      return null;
    };
  }

  private validatePattern(value: string): boolean {
    if (value !== null && value !== undefined) {
      const regex = new RegExp(this.pattern);
      return regex.test(value);
    }
    return false;
  }

  getErrorMessage(): string {
    if (this.formControl.hasError('required') && this.formControl.touched) {
      return '*This field is required.';
    }

    if (this.formControl.hasError('pattern') && this.formControl.touched) {
      switch (this.inputType) {
        case 'text':
          return '*Bitte schreiben Sie einen Namen und Nachnamen.';
        case 'email':
          return '*Diese E-Mail-Adresse ist leider ungültig.';
        case 'password':
          return '*Bitte geben Sie ein Passwort ein.';
        default:
          return '*Invalid input.';
      }
    }

    return '';
  }
}
