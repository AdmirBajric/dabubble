import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoverChangeDirective } from "../../../directives/hover-change.directive";


@Component({
  selector: 'app-button-workspace',
  standalone: true,
  imports: [CommonModule, HoverChangeDirective],
  templateUrl: './button-workspace.component.html',
  styleUrl: './button-workspace.component.scss'
})
export class ButtonWorkspaceComponent {
  isOpen: boolean = true;
  @Output() toggle = new EventEmitter<boolean>();

  get buttonText(): string {
    return this.isOpen ? 'Workspace-Menü schließen' : 'Workspace-Menü öffnen';
  }

  toggleWorkspace() {
    this.isOpen = !this.isOpen;
    this.toggle.emit(this.isOpen);
  }
}
