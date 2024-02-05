import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from "../../input/input.component";
import { SearchbarComponent } from "../../searchbar/searchbar.component";
import { Observable, of } from 'rxjs';
import { NgIf, CommonModule } from '@angular/common';

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
    SearchbarComponent
  ]
})
export class DialogAddMemberChannelComponent {
  availableUserChoosen: boolean = false;                                       /**** boolean for button mocking abled state */
  isSearchbarEmpty: boolean = true;                                            /** boolean to regulate display of search results */

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
  room = this.data[0];

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
}
