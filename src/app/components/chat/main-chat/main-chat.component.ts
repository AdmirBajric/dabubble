import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatHeaderComponent } from "../../shared/chat-header/chat-header.component";
import { MessageInputComponent } from "../../shared/message-input/message-input.component";
import { MessageComponent } from "../../chat/message/message.component";
import { RouteService } from "../../../services/route.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
import { RouterLink } from "@angular/router";
@Component({
    selector: 'app-main-chat',
    standalone: true,
    imports: [ChatHeaderComponent, CommonModule, HoverChangeDirective, MessageComponent, MessageInputComponent, RouterLink],
    templateUrl: './main-chat.component.html',
    styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
    @Input() roomName: string = "Entwicklerteam"; //gets name from Dashboard
    @Output() roomNameHeader: string = "Entwicklerteam"; // gives name to chat-header
    constructor(private routeService: RouteService) { }

    get isNotDashboard() {
        return !this.routeService.checkRoute('/dashboard');
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
                created_at: "2024-01-12T10:01:00",
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

            created_at: "2024-01-12T10:02:00",
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
    ];
}
