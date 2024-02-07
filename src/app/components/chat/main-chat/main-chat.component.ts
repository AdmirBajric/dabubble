import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ChatHeaderComponent } from "../../shared/chat-header/chat-header.component";
import { MessageInputComponent } from "../../shared/message-input/message-input.component";
import { MessageComponent } from "../../chat/message/message.component";
import { RouteService } from "../../../services/route.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
import { RouterLink } from "@angular/router";
import { TimeSeparatorChatComponent } from "../../shared/time-separator-chat/time-separator-chat.component";

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
    constructor(private routeService: RouteService) {
    }

    get isNotDashboard() {
        return !this.routeService.checkRoute('/dashboard');
    }

    ngOnInit(): void {
    }
    /**
     * Compares the day, month & year of two given messagetimestamps. 
     * It returns true, if the two messages are sent on different days, 
     * so the time-separator must be shown.
     * @param {number} time0 - timestamp of previous message
     * @param {number} time1 - timestamp of message
     * @returns {boolean}
     */
    isDifferentDay(time0: number, time1: number) {
        const previousDate = new Date(time0);
        const currentDate = new Date(time1);

        return previousDate.getDate() !== currentDate.getDate() ||
            previousDate.getMonth() !== currentDate.getMonth() ||
            previousDate.getFullYear() !== currentDate.getFullYear();
    }

    messages: any[] = [
        {
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
                created_at: "2024-01-21T10:01:00",
                reaction: [{}],
            }],
            reaction: [{}],
        },
        {
            sender: {
                fullName: 'Julius Marecek',
                email: "",
                password: "",
                avatar: '../../assets/img/avatar1.svg',
                isOnline: true,
            },

            message: "Hallo ich bin eine zweite testnachricht an Admir",
            receiver: {
                fullName: 'Admir Bajric',
                email: "",
                password: "",
                avatar: '../../assets/img/avatar1.svg',
                isOnline: true,
            },

            created_at: "2024-02-01T10:02:00",
            room: "",
            answers: [{
                sender: {
                    fullName: 'Julius Marecek',
                    email: "",
                    password: "",
                    avatar: '../../assets/img/avatar1.svg',
                    isOnline: true,
                },
                message: "Hallo ich bin die Antwort auf deine zweite testnachricht",
                created_at: "2024-01-12T10:03:00",
                reaction: [{}],
            }],
            reaction: [{}],
        },
        {
            sender: {
                fullName: 'Julius Marecek',
                email: "",
                password: "",
                avatar: '../../assets/img/avatar1.svg',
                isOnline: true,
            },

            message: "Hallo?",
            receiver: {
                fullName: 'Admir Bajric',
                email: "",
                password: "",
                avatar: '../../assets/img/avatar1.svg',
                isOnline: true,
            },

            created_at: "2024-02-07T10:02:00",
            room: "",
            answers: [{
                sender: {
                    fullName: 'Julius Marecek',
                    email: "",
                    password: "",
                    avatar: '../../assets/img/avatar1.svg',
                    isOnline: true,
                },
                message: "Hallo, wie geht's? ",
                created_at: "2024-01-06T00:00:01",
                reaction: [{}],
            }],
            reaction: [{}],
        },
    ];
}
