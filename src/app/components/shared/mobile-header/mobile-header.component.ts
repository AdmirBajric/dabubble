import { Component, Input } from '@angular/core';
import { LogoComponent } from "../logo/logo.component";
import { ProfileMenuComponent } from "../../dashboard/profile-menu/profile-menu.component";
import { NgIf } from '@angular/common';
import { chatNavigationService } from '../../../services/chat-navigation.service';


@Component({
    selector: 'app-mobile-header',
    standalone: true,
    templateUrl: './mobile-header.component.html',
    styleUrl: './mobile-header.component.scss',
    imports: [LogoComponent, NgIf, ProfileMenuComponent]
})
export class MobileHeaderComponent {
    @Input() logoStyling!: string;
    constructor(private navService: chatNavigationService){}
    closeMainChat(){
        this.navService.closeChat();
        this.navService.closeNewMessage();
    }
}
