import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProfileViewComponent } from "../../profile/profile-view/profile-view.component";
import { MessageHoverActionsComponent } from '../../shared/message-hover-actions/message-hover-actions.component';
import { Message } from '../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../services/chat-navigation.service';

@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  imports: [FormsModule, HoverChangeDirective, MessageHoverActionsComponent, NgIf, ProfileViewComponent]
})
export class MessageComponent implements OnInit {
  constructor(private navService: chatNavigationService) { }
  loggedUser = "Selina Karlin"
  @Input() message: any;
  @Input() showAnswers!: boolean;
  // @Output() showThread = new EventEmitter<any[]>();
  answersCount!: number;
  lastAnswerTime!: string;
  showActions: boolean = false;
  openMessageEdit: boolean = false;
  saveOriginalMessage!: string; // to reset the message text when editing is cancelled

  ngOnInit(): void {
    console.log(this.showAnswers);
    if (this.showAnswers) {
      // this.TimeToStringAnswer();
    }
  }

  getTimeFromString(dateTimeString: string): string {
    const dateObject = new Date(dateTimeString);

    const stunden = dateObject.getHours();
    const minuten = dateObject.getMinutes();

    // Führende Nullen hinzufügen, wenn die Minuten einstellig sind
    const formatierteMinuten = minuten < 10 ? '0' + minuten : minuten;

    // Das resultierende Zeitformat ist z.B. "10:30"
    const zeitFormat = `${stunden}:${formatierteMinuten}`;

    return zeitFormat;
  }

  // countAnswers() {
  //   this.answersCount = this.comment.length;
  // }

  TimeToStringAnswer() {
    // this.countAnswers();
    let time = this.message.answers[this.answersCount - 1].timestamp;
    this.lastAnswerTime = this.getTimeFromString(time);
  }

  showAnswersinThread(m: any[]) {
    // this.showThread.emit(answers); old way
    this.navService.openThread(m);
  }

  editMessage(m: Message) {
    this.handlingMessageHoverActions();
    this.saveOriginalMessage = m.text;
    this.openMessageEdit = true;
  }

  handlingMessageHoverActions() {
    this.showActions = false;
  }

  saveEditedMessage() {

  }

  cancelMessageEditing() {
    this.openMessageEdit = false;
    this.message.text = this.saveOriginalMessage;
  }

  addEmoji() {

  }

}
