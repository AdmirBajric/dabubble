import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [NgIf],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit{
  ngOnInit(): void {
    this.TimeToStringAnswer();
  }

  loggedUser = "Julius Marecek"
  @Input() message :any;
  answersCount! :number;
  lastAnswerTime! :string; 

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

countAnswers(){
  this.answersCount = this.message.answers.length;
}

TimeToStringAnswer(){
  this.countAnswers();
  let time = this.message.answers[this.answersCount -1].created_at;
  this.lastAnswerTime = this.getTimeFromString(time);
  }

}
