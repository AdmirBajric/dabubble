import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MessageComponent } from "../chat/message/message.component";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { UserProfileNavComponent } from "../profile/user-profile-nav/user-profile-nav.component";
import { LogoComponent } from "../shared/logo/logo.component";
import { SearchbarComponent } from "../shared/searchbar/searchbar.component";
import { ThreadComponent } from "../chat/thread/thread.component";
import { ButtonWorkspaceComponent } from "./button-workspace/button-workspace.component";
import { MessageInputComponent } from "../shared/message-input/message-input.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        CommonModule,
        WorkspaceComponent,
        MessageComponent,
        UserProfileNavComponent,
        LogoComponent,
        SearchbarComponent,
        ThreadComponent,
        ButtonWorkspaceComponent,
        MessageInputComponent
    ]
})
export class DashboardComponent {
    workspaceIsOpen: boolean = true;
    gridAreaRegulation: string = 'nct';
    handleWorkspaceToggle(isOpen: boolean) {
        this.workspaceIsOpen = isOpen;
        this.handleGridAreaToggle(isOpen);
    }

    handleGridAreaToggle(isOpen: boolean){
        if (isOpen === true) {
            this.gridAreaRegulation = 'nct';
            console.log(this.gridAreaRegulation);
        } else {
            this.gridAreaRegulation = 'cct'
            console.log(this.gridAreaRegulation);
        }
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
