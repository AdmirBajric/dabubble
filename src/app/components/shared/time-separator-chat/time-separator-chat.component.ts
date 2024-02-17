import { Component, Input, LOCALE_ID } from '@angular/core';
import de from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';

@Component({
  selector: 'app-time-separator-chat',
  standalone: true,
  imports: [],
  templateUrl: './time-separator-chat.component.html',
  styleUrl: './time-separator-chat.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' } 
  ],
})
export class TimeSeparatorChatComponent {
  @Input() timestamp!: Date;
  formattedDate!: string;

  constructor() {
    registerLocaleData(de);
  }

  
  /**
   * Calls the function to format date.
   */
  ngOnInit() {
    this.formatDate();
  }
  
  /**
   * Creates a new Date object from timestamp property which is given as Input by the parent element.
   * Formats this date according to wanted format.
   * If timestamp = today, it says 'heute'.
   */
  formatDate() {
    const date = new Date(this.timestamp);
    if (this.isToday(date)) {
      this.formattedDate = 'Heute';
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long'};
      this.formattedDate = new Intl.DateTimeFormat('de-DE', options).format(date);
    }
  }

  /**
   * Checks if the date is today.
   * @param {Date} date
   * @returns {boolean}
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }
}
