import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../../directives/hover-change.directive';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    HoverChangeDirective,
    MatIconModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class DialogUserListComponent implements OnInit {
  @Input() users!: any[];
  @Output() selectedUser = new EventEmitter<any[]>();
  selectedUsersList: any[] = []; // array for saving selected users.

  ngOnInit() {
  }
  
  /**
   * Takes an array of user (obj) and checks if user is already in selectedUsersList.
   * If not: pushes the user to selectedUsersList and emits the event as selectedUser.
   * @param {any[]} user
   */
  selectUserForChannel(user: any[]) {
    if (!this.selectedUsersList.includes(user)) {
      this.selectedUsersList.push(user);
      this.selectedUser.emit(user);
      this.deleteUserFromArray(user);
    }
  }
  
  /**
   * Deletes the user from 'users'[]. The user to delete is the one, that is selected to add to channel.
   * This user will be display in parent element: dialog-add-member-channel.
   * @param {any[]} selectedUserToDelete
   */
  deleteUserFromArray(selectedUserToDelete: any[]): void{
    const index = this.users.indexOf(selectedUserToDelete);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}
