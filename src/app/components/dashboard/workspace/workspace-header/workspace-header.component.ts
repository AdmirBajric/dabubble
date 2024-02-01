import { Component, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileMenuComponent } from "../../profile-menu/profile-menu.component";
import { HoverChangeDirective } from "../../../../directives/hover-change.directive";
import { EventEmitter } from '@angular/core';
@Component({
    selector: 'app-workspace-header',
    standalone: true,
    templateUrl: './workspace-header.component.html',
    styleUrl: './workspace-header.component.scss',
    imports: [CommonModule, HoverChangeDirective, ProfileMenuComponent]
})
export class WorkspaceHeaderComponent {
  writeMessage!: boolean;
  // *************event must be directed to grandparent (/dashboard) through parent (/workspace)
  @Output() openChatWriteNewMessage = new EventEmitter<boolean>();
  constructor(public router: Router){}

  writeNewMessage(){
    this.writeMessage = true;
    this.openChatWriteNewMessage.emit(this.writeMessage);
  }
}
