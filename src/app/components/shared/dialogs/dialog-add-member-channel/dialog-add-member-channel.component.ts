import { Component, Inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from "../../input/input.component";
import { SearchbarComponent } from "../../searchbar/searchbar.component";
import { Observable, of } from 'rxjs';
import { NgIf, CommonModule } from '@angular/common';
import { ButtonFunctionService } from '../../../../services/button-function.service';
import { DialogUserListComponent } from "./user-list/user-list.component";

@Component({
    selector: 'app-dialog-add-member-channel',
    standalone: true,
    templateUrl: './dialog-add-member-channel.component.html',
    styleUrl: './dialog-add-member-channel.component.scss',
    imports: [
        CommonModule,
        HoverChangeDirective,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        NgIf,
        InputComponent,
        SearchbarComponent,
        DialogUserListComponent
    ]
})
export class DialogAddMemberChannelComponent implements OnInit{
  availableUserChoosen: boolean = false;                                       /**** boolean for button mocking abled state */
  isSearchbarEmpty: boolean = true;                                            /** boolean to regulate display of search results */
  selectedUsers: any[] = [];
  /**
   * An Observable property respresenting a list of users for adding to a specific channel.
   * Initialized with an empty array as the default value.
   * @type {Observable<any[]>}
   * @memberof DialogAddMemberChannelComponent
   */
  userListForAddingChannel$: Observable<any[]> = of([]);
  
  /**
   * Creates an instance of DialogAddMemberChannelComponent.
   * @constructor
   * @param {MatDialogRef<DialogAddMemberChannelComponent>} dialogRef
   * @param {*} data
   */
  constructor(public dialogRef: MatDialogRef<DialogAddMemberChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  // sets data that is given by parent element /chat-header of specific channel as room to be red in HTML
  channel = this.data;
  
  ngOnInit(): void {
  }
  
  closeDialog() {
    this.dialogRef.close();
  }
  
  /**
   * Receives a list of users and updates the DOM-content.
   *  - Sets userListForAddingChannel$ to an observable containing the provided userList from child: searchbar.component.
   * @param {any[]} userList - An array containing user data to be displayed.
   */
  receiveUserList(userList: any[]) {
    this.userListForAddingChannel$ = of(userList);
    // console.log(userList);
  }

  /**
   * Updates the isSearchbarEmpty property  based on the provided boolean value, that comes from child component: searchbar.component.
   * @param {boolean} isEmpty - A boolean value indicating if the search input is empty.  * If true = HTML should not render information about search
   *                                                                                      * If false = HTML should render information about search
   */
  onSearchInputChange(isEmpty: boolean) {
    this.isSearchbarEmpty = isEmpty;
  }
  
  /**
   * Handles changes in user selection emitted as an event from child component: user-list.
   * - checks if the given user is already in the array of 'selectedUsers'.
   *      - if no: pushes user to the array
   *      - if yes: deletes user from the array
   * @param {any[]} user
   */
  userSelectionChange(user: any[]){
    const index = this.selectedUsers.findIndex(selectedUser => selectedUser === user);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  /**
 * Removes a user from the current selection.
 * 
 * This function is used to remove a specific user from the `selectedUsers` array. It first logs the state of 
 * `selectedUsers` prior to any operation. Then, it locates the index of the user to delete within the array.
 * If the user is found (i.e., the index is not -1), the user is removed from the array. After the deletion,
 * it logs the updated state of `selectedUsers`.
 * 
  
  /**
   * Removes a user from the array 'selectedUsers'
   * - gets index of the user in the array
   * - deletes the user in the array
   * @param {any[]} userToDelete
   */
  removeUserFromSelection(userToDelete: any[]){
    const index = this.selectedUsers.indexOf(userToDelete);
    if (index !== -1){
      this.selectedUsers.splice(index, 1);
    }
  }
}
