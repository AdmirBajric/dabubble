import { Component } from '@angular/core';
import { LogoComponent } from "../logo/logo.component";
import { ProfileMenuComponent } from "../../dashboard/profile-menu/profile-menu.component";

@Component({
    selector: 'app-mobile-header',
    standalone: true,
    templateUrl: './mobile-header.component.html',
    styleUrl: './mobile-header.component.scss',
    imports: [LogoComponent, ProfileMenuComponent]
})
export class MobileHeaderComponent {

}
