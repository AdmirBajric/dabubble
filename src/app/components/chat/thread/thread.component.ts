import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { EmojisComponent } from "../../shared/emojis/emojis.component";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { MessageInputComponent } from "../../shared/message-input/message-input.component";
@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, EmojisComponent, PickerModule, MessageInputComponent]
})
export class ThreadComponent implements OnInit {
  @Input() threadData!: any;
  @Output() closeThread = new EventEmitter<any[]>();
  loggedUser = "Julius Marecek";
  answersCount!: number;

  exitThread(){
    this.closeThread.emit();
  }

  ngOnInit() {
    this.threadData = {
      sender: {
        fullName: 'Admir Bajric',
        email: "",
        password: "",
        avatar: '../../assets/img/avatar1.svg',
        isOnline: true,
      },

      message: "Hallo ich bin die erste testnachricht",
      receiver: {
        fullName: 'Julius Marecek',
        email: "",
        password: "",
        avatar: '../../assets/img/avatar1.svg',
        isOnline: true,
      },

      created_at: "2024-01-12T10:00:00",
      room: "",
      answers: [{
        sender: {
          fullName: 'Julius Marecek',
          email: "",
          password: "",
          avatar: '../../assets/img/avatar1.svg',
          isOnline: true,
        },
        message: "Hallo ich bin die Antwort auf deine erste testnachricht",
        created_at: "2024-01-12T10:01:00",
        reaction: [
          {
            sender: 'Selina Karlin',
            emojiId: 'innocent'
          }
        ],
      }],
      reaction: [{}],
    },
      console.table('thread:', this.threadData);
    this.countAnswers();
    console.log(this.threadData.reaction.length)
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

  countAnswers() {
    this.answersCount = this.threadData.answers.length;
  }

}
