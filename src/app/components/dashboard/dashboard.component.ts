import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { MessageComponent } from "../../message/message.component";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { UserProfileNavComponent } from "../profile/user-profile-nav/user-profile-nav.component";
import { LogoComponent } from "../shared/logo/logo.component";
import { SearchbarComponent } from "../shared/searchbar/searchbar.component";
import { ThreadComponent } from "../chat/thread/thread.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        HeaderComponent,
        WorkspaceComponent,
        MessageComponent,
        UserProfileNavComponent,
        LogoComponent,
        SearchbarComponent,
        ThreadComponent
    ]
})
export class DashboardComponent {

}
