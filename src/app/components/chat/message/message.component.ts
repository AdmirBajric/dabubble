import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProfileViewComponent } from "../../profile/profile-view/profile-view.component";
import { MessageHoverActionsComponent } from '../../shared/message-hover-actions/message-hover-actions.component';
import { Message } from '../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { HoverChangeDirective } from '../../../directives/hover-change.directive';

@Component({
    selector: 'app-message',
    standalone: true,
    templateUrl: './message.component.html',
    styleUrl: './message.component.scss',
    imports: [FormsModule, HoverChangeDirective, MessageHoverActionsComponent, NgIf, ProfileViewComponent]
})
export class MessageComponent implements OnInit {
  ngOnInit(): void {
    this.TimeToStringAnswer();
  }
  loggedUser = "Julius Marecek"
  @Input() message: any;
  @Output() showThread = new EventEmitter<any[]>();
  answersCount!: number;
  lastAnswerTime!: string;
  showActions: boolean = false;
  openMessageEdit: boolean = false;
  saveOriginalMessage!: string;
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

  countAnswers() {
    this.answersCount = this.message.answers.length;
  }

  TimeToStringAnswer() {
    this.countAnswers();
    let time = this.message.answers[this.answersCount - 1].created_at;
    this.lastAnswerTime = this.getTimeFromString(time);
  }

  showAnswersinThread(answers: any[]) {
    this.showThread.emit(answers);
  }

  editMessage(m: Message){
    this.handlingMessageHoverActions();
    this.saveOriginalMessage = m.text;
    this.openMessageEdit = true;
  }

  handlingMessageHoverActions(){
    this.showActions = false;
  }

  saveEditedMessage(){

  }

  cancelMessageEditing(){
    this.openMessageEdit = false;
    this.message.text = this.saveOriginalMessage;
  }

  addEmoji(){

  }

}
