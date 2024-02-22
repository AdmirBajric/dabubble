import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MessageComponent } from "../chat/message/message.component";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { LogoComponent } from "../shared/logo/logo.component";
import { SearchbarComponent } from "../shared/searchbar/searchbar.component";
import { ThreadComponent } from "../chat/thread/thread.component";
import { ButtonWorkspaceComponent } from "./button-workspace/button-workspace.component";
import { MessageInputComponent } from "../shared/message-input/message-input.component";
import { ProfileMenuComponent } from "./profile-menu/profile-menu.component";
import { ChatHeaderComponent } from "../shared/chat-header/chat-header.component";
import { MainChatComponent } from "../chat/main-chat/main-chat.component";
import { NewMessageComponent } from "../chat/main-chat/new-message/new-message.component";
import { chatNavigationService } from '../../services/chat-navigation.service';
import { Subscription } from 'rxjs';
import { MobileHeaderComponent } from "../shared/mobile-header/mobile-header.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        CommonModule,
        WorkspaceComponent,
        MessageComponent,
        LogoComponent,
        SearchbarComponent,
        ThreadComponent,
        ButtonWorkspaceComponent,
        MessageInputComponent,
        ProfileMenuComponent,
        ChatHeaderComponent,
        MainChatComponent,
        NewMessageComponent,
        MobileHeaderComponent
    ]
})
export class DashboardComponent implements OnInit {
    workspaceIsOpen: boolean = true;
    threadIsOpen: boolean = false;
    gridAreaRegulation: string = 'nct';
    selectedMessageForThread: any[] = [];
    activateThreadHeader: boolean = true; // must be set to true, because the default grid style shows all 3 main components of dashboard
    showMessages: boolean = true; // default
    writeNewMessage: boolean = false // default
    private threadStatusSubscription!: Subscription;
    private chatStatusSubscription!: Subscription;
    windowWidth!: number;
    mobileView!: boolean;
    mobilePage!: string;
    channelOpenStatusSubscription: any;
    showChat: boolean = false;
    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.checkWindowSize();
    }

    constructor(private navService: chatNavigationService,
        private renderer: Renderer2,
        private elementRef: ElementRef,
    ) { }

    ngOnInit(): void {
        this.handleGridAreaToggle();
        this.subscribeToThreadStatus();
        this.checkWindowSize();
        this.subscribeChatStatus();
        this.subscribeChannelStatus();
    }

    private checkWindowSize(): void {
        this.windowWidth = this.renderer.parentNode(
            this.elementRef.nativeElement
        ).ownerDocument.defaultView.innerWidth;
        if (this.windowWidth <= 1100) {
            this.mobileView = true;
            // this.mobilePage = 'home';
        } else {
            this.mobileView = false;
        }
    }

    subscribeToThreadStatus() {
        this.threadStatusSubscription = this.navService.threadStatus$.subscribe(isOpen => {
            this.threadIsOpen = isOpen;
            if (isOpen === true) {
                this.mobilePage = 'thread';
            } else if (isOpen === false){
                this.mobilePage = 'chat';
            }
            // console.log('threadStatus:', isOpen, 'channel status', this.channelOpenStatusSubscription, this.openChatofChannel);
            
            this.handleGridAreaToggle();
        })
    }

    subscribeChatStatus() {
        this.chatStatusSubscription = this.navService.currentChannel.subscribe(value => {
            console.log(value);

        })
    }

    subscribeChannelStatus() {
        this.channelOpenStatusSubscription = this.navService.channelStatus$.subscribe(isOpen => {
            this.showChat = isOpen;
            if (isOpen === true) {
                this.mobilePage = 'chat'
            } else if (isOpen === false) {
                this.mobilePage = 'home'
            }

        })
    }

    handleWorkspaceToggle(isOpen: boolean) {
        this.workspaceIsOpen = isOpen;
        this.handleGridAreaToggle();
    }

    handleGridAreaToggle() {
        if (this.workspaceIsOpen && this.threadIsOpen === true) {
            this.gridAreaRegulation = 'nct';
        } else if (!this.workspaceIsOpen && this.threadIsOpen) {
            this.gridAreaRegulation = 'cct'
        } else if (!this.workspaceIsOpen && !this.threadIsOpen) {
            this.gridAreaRegulation = 'ccc';
        } else if (this.workspaceIsOpen && !this.threadIsOpen) {
            this.gridAreaRegulation = 'ncc';
        }
    }

    openNewMessage() {
        // toggling does not help because it's a one way way
        this.showMessages = false;
        this.writeNewMessage = true;
    }

    openChatofChannel() {
        // we need to get id of channel, so the correct content can be displayed
        this.showMessages = true;
        this.writeNewMessage = false;
    }

    ngOnDestroy() {
        this.threadStatusSubscription.unsubscribe();
        this.channelOpenStatusSubscription.unsubscribe();
        this.threadStatusSubscription.unsubscribe();
    }
}
