import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileMenuComponent } from "../../profile-menu/profile-menu.component";

@Component({
    selector: 'app-workspace-header',
    standalone: true,
    templateUrl: './workspace-header.component.html',
    styleUrl: './workspace-header.component.scss',
    imports: [CommonModule, ProfileMenuComponent]
})
export class WorkspaceHeaderComponent {
  constructor(public router: Router){}
}
