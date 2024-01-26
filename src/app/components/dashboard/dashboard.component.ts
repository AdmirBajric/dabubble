import { Component } from '@angular/core';
import { MessageComponent } from "../chat/message/message.component";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { UserProfileNavComponent } from "../profile/user-profile-nav/user-profile-nav.component";
import { LogoComponent } from "../shared/logo/logo.component";
import { SearchbarComponent } from "../shared/searchbar/searchbar.component";
import { ThreadComponent } from "../chat/thread/thread.component";
import { ButtonWorkspaceComponent } from "./button-workspace/button-workspace.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        WorkspaceComponent,
        MessageComponent,
        UserProfileNavComponent,
        LogoComponent,
        SearchbarComponent,
        ThreadComponent,
        ButtonWorkspaceComponent
    ]
})
export class DashboardComponent {
    workspaceStatus: boolean = true
    handleWorkspaceToggle(isOpen: boolean){
        console.log(isOpen);
        this.workspaceStatus = isOpen;
    }
}
