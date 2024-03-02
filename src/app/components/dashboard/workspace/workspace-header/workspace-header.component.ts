import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileMenuComponent } from '../../profile-menu/profile-menu.component';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { chatNavigationService } from '../../../../services/chat-navigation.service';
@Component({
  selector: 'app-workspace-header',
  standalone: true,
  templateUrl: './workspace-header.component.html',
  styleUrl: './workspace-header.component.scss',
  imports: [CommonModule, HoverChangeDirective, ProfileMenuComponent],
})
export class WorkspaceHeaderComponent {
  constructor(
    public router: Router,
    private navService: chatNavigationService
  ) {}
  writeNewMessage() {
    this.navService.openNewMessage();
  }
}
