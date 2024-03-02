import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageInputComponent } from "../../../shared/message-input/message-input.component";
import { NgIf, NgFor } from '@angular/common';
import { MessageComponent } from "../../message/message.component";

@Component({
  selector: 'app-direct-message',
  standalone: true,
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
  imports: [CommonModule, NgIf, NgFor, MessageInputComponent, MessageComponent]
})
export class DirectMessageComponent implements OnInit {
  chatEmpty: boolean = true;
  chat: any[] = [
    {
      member: {
        fullName: 'Admir Bajric',
        email: "",
        password: "",
        avatar: '../../../../../assets/img/avatar1.svg',
        isOnline: true,
      },
      messages: [
        {
          sender: 'Admir Bajric',
          content: "Hallo, hast Du kurz Zeit für einen Call? Ich habe eine Frage zum EventBinding in Angular.",
          created_at: "2024-01-21T10:09:02"
        },
        {
          sender: 'Guest User',
          content: "Hey Admir, klar! Ich rufe Dich in 2 Minuten an.",
          created_at: "2024-01-21T10:18:55"
        },
      ]
    }
  ];

  ngOnInit(){
    // iterate through chat array to see if messages is empty. If yes: set boolean to true; If no: set boolean to false && display chat via app-message
  }

}