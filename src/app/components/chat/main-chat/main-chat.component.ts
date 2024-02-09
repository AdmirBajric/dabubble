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
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Subscription } from 'rxjs';
import { Channel } from 'diagnostics_channel';

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
    currentChannel!: Channel[];

    private channelOpenStatusSubscription!: Subscription;
    showChannel: boolean = false;

    constructor(
        private routeService: RouteService,
        private navServie: chatNavigationService) {
    }

    get isNotDashboard() {
        return !this.routeService.checkRoute('/dashboard');
    }

    ngOnInit(): void {
        this.subscribeToCurrentChannel();
        this.subscribeChannelStatus();
    }

    subscribeChannelStatus() {
        this.channelOpenStatusSubscription = this.navServie.channelStatus$.subscribe(isOpen => {
            this.showChannel = isOpen;
        })
    }

    subscribeToCurrentChannel() {
        this.navServie.currentChannel.subscribe(channel => {
            this.currentChannel = channel;
        })
    }

    ngOnDestroy() {
        if (this.channelOpenStatusSubscription) {
            this.channelOpenStatusSubscription.unsubscribe();
        }
    }

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
