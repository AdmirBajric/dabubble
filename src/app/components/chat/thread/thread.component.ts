import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { CommonModule } from "@angular/common";
import { EmojisComponent } from "../../shared/emojis/emojis.component";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { MessageInputComponent } from "../../shared/message-input/message-input.component";
import { WorkspaceHeaderComponent } from "../../dashboard/workspace/workspace-header/workspace-header.component";
import { Router } from "@angular/router";
@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, EmojisComponent, PickerModule, MessageInputComponent, WorkspaceHeaderComponent]
})
export class ThreadComponent implements OnInit {
  @Input() threadData!: any;
  @Output() closeThread = new EventEmitter<any[]>();

  loggedUser = "Julius Marecek";
  answersCount!: number;
  mobileView!: boolean;
  windowWidth!: number;
  renderer: any = Renderer2;
  el: any = ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }

  constructor(
    renderer: Renderer2,
    el: ElementRef,
    public router: Router
    ) {
      this.renderer = renderer;
      this.el = el;
      const screenWidth = window.innerWidth;

      if (screenWidth <= 1100) {
        this.mobileView = true;
      } else {
        this.mobileView = false;
      }
     }

  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.el.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }

  exitThread() {
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
