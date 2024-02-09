import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ChatHeaderComponent } from "../../shared/chat-header/chat-header.component";
import { MessageInputComponent } from "../../shared/message-input/message-input.component";
import { MessageComponent } from "../../chat/message/message.component";
import { RouteService } from "../../../services/route.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
import { RouterLink } from "@angular/router";
import { TimeSeparatorChatComponent } from "../../shared/time-separator-chat/time-separator-chat.component";
import { Comment, Message } from '../../../models/message.class';
import { User } from '../../../models/user.class';

@Component({
    selector: 'app-main-chat',
    standalone: true,
    templateUrl: './main-chat.component.html',
    styleUrl: './main-chat.component.scss',
    imports: [ChatHeaderComponent, CommonModule, HoverChangeDirective, MessageComponent, MessageInputComponent, RouterLink, TimeSeparatorChatComponent],

})
export class MainChatComponent implements OnInit {
    @Input() roomName: string = "Entwicklerteam"; //gets name from Dashboard
    @Output() roomNameHeader: string = "Entwicklerteam"; // gives name to chat-header
    user1!: User;
    user2!: User;
    comment!: Comment[];
    messages!: Message[];
    constructor(private routeService: RouteService) {
    }

    get isNotDashboard() {
        return !this.routeService.checkRoute('/dashboard');
    }

    ngOnInit(): void {
        // ####################################################################################################   DUMMY
        this.user1 = new User({
            id: '1',
            fullName: 'Admir Bajric',
            email: 'admir@example.com',
            avatar: '../../assets/img/avatar1.svg',
            isOnline: true,
        })

        this.user2 = new User({
            id: '1',
            fullName: 'Selina Karlin',
            email: 'admir@example.com',
            avatar: '../../assets/img/avatar2.svg',
            isOnline: true,
        })

        this.comment = this.createFakeComments();

        this.messages = [
            new Message({
              text: "Hallo, das ist die erste Fake-Nachricht.",
              timestamp: new Date(),
              creator: this.user1,
              channelId: "channel1",
              reactions: []  // Kann leer gelassen oder ganz weggelassen werden, da nicht benötigt
            }),
            new Message({
              text: "Hier ist eine weitere interessante Nachricht.",
              timestamp: new Date(),
              creator: this.user2,
              channelId: "channel1",
              reactions: []  // Kann leer gelassen oder ganz weggelassen werden, da nicht benötigt
            }),
            new Message({
              text: "Und das ist die dritte Nachricht im Bunde.",
              timestamp: new Date(),
              creator: this.user1,
              channelId: "channel2",
              reactions: []  // Kann leer gelassen oder ganz weggelassen werden, da nicht benötigt
            })
          ];

    }

    createFakeComments(): Comment[] {
        const fakeCommentsData = [
            {
                text: "Das ist ein großartiger Beitrag!",
                timestamp: new Date(),
                creator: new User({
                    fullName: 'Max Mustermann',
                    email: 'max@example.com',
                    avatar: '../../assets/img/avatar2.svg',
                    isOnline: true,
                }),
                reactions: [],
                messageId: "1",
            },
            {
                text: "Interessanter Punkt, ich stimme zu.",
                timestamp: new Date(),
                creator: new User({
                    fullName: 'Julia Müller',
                    email: 'julia@example.com',
                    avatar: '../../assets/img/avatar3.svg',
                    isOnline: false,
                }),
                reactions: [],
                messageId: "2",
            },
            {
                text: "Könntest du dazu mehr Informationen bereitstellen?",
                timestamp: new Date(),
                creator: new User({
                    fullName: 'Andreas Schmidt',
                    email: 'andreas@example.com',
                    avatar: '../../assets/img/avatar4.svg',
                    isOnline: true,
                }),
                reactions: [],
                messageId: "3",
            }
        ];

        return fakeCommentsData.map(data => new Comment(data));
    }

    // ##################################################################################### DUMMY END!
    /**
     * Compares the day, month & year of two given messagetimestamps. 
     * It returns true, if the two messages are sent on different days, 
     * so the time-separator must be shown.
     * @param {Date} time0 - timestamp of previous message
     * @param {Date} time1 - timestamp of message
     * @returns {boolean}
     */
    isDifferentDay(time0: Date, time1: Date) {
        const previousDate = new Date(time0);
        const currentDate = new Date(time1);

        return previousDate.getDate() !== currentDate.getDate() ||
            previousDate.getMonth() !== currentDate.getMonth() ||
            previousDate.getFullYear() !== currentDate.getFullYear();
    }
}
