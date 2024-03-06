import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class InputComponent implements OnInit {
  constructor(public router: Router) {}
  isInputActive: boolean = false;
  @Input() initialValue: string = '';
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

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Sets the initial value of the form control.
   */
  ngOnInit() {
    this.formControl.setValue(this.initialValue);
  }

  /**
   * Sets the `isInputActive` flag to true when the input field gains focus, indicating the input is currently active.
   */
  handleFocus() {
    this.isInputActive = true;
  }

  /**
   * Resets the `isInputActive` flag to false when the input field loses focus and marks the form control as touched.
   * Emits the validity state of the form control.
   */
  handleBlur() {
    this.isInputActive = false;
    this.formControl.markAsTouched();
    this.validityChanged.emit(this.formControl.valid);
  }

  /**
   * Emits the current validity state of the form control upon any input by the user.
   */
  handleInput() {
    this.isInputActive = false;
    this.formControl.markAsTouched();
    this.validityChanged.emit(this.formControl.valid);
  }

  /**
   * Returns a validator to check the value of the form control against a defined pattern.
   * @returns validator function that returns null if the value matches the pattern or an error object if it does not.
   */
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

  /**
   * Validates the form control's value against the specified pattern.
   * @param {string} value - value to be validated.
   * @returns {boolean} - true if the value matches the pattern, false otherwise.
   */
  private validatePattern(value: string): boolean {
    if (value !== null && value !== undefined) {
      const regex = new RegExp(this.pattern);
      return regex.test(value);
    }
    return false;
  }

  /**
   * Determines the error message to display based on the type of validation error encountered by the form control.
   * @returns {string} The appropriate error message for the encountered validation error.
   */
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
          return '*Mindestens 6 Zeichen erforderlich.';
        default:
          return '*Invalid input.';
      }
    }

    return '';
  }
}
