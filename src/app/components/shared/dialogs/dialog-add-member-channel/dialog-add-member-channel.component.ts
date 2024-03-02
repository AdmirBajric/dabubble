import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from '../../input/input.component';
import { SearchbarComponent } from '../../searchbar/searchbar.component';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogUserListComponent } from './user-list/user-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FirebaseService } from '../../../../services/firebase.service';
import { Firestore } from '@angular/fire/firestore';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogInputComponent } from '../dialog-input/dialog-input.component';

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
    DialogUserListComponent,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTooltipModule,
    DialogInputComponent,
  ],
})
export class DialogAddMemberChannelComponent implements OnInit {
  user!: any;
  text: string = '';
  showUserInput: string[] = [];
  isUserInput: boolean = false;
  usersSearch: boolean = false;
  users: any[] = [];
  userInputValue: string = '';
  placeholder: string = 'Mitglied suchen!';
  filteredUsers: any[] = [];
  chosenUsers: any[] = [];
  inputOnSearch: boolean = false;
  checked: boolean = false;
  search: boolean = false;
  noMembers: boolean = false;

  firestore: Firestore = inject(Firestore);

  /**
   * Creates an instance of DialogAddMemberChannelComponent.
   * @constructor
   * @param {MatDialogRef<DialogAddMemberChannelComponent>} dialogRef
   * @param {*} data
   */
  constructor(
    private firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<DialogAddMemberChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.setUser();
  }
  // sets data that is given by parent element /chat-header of specific channel as room to be red in HTML
  channel = this.data;

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  /**
   * Checks if local array has entries to set noMembers:boolean
   * to true - if there are no members.
   */
  checkIfUser(availableUsers: any): void {
    if (availableUsers.length === 0) {
      this.noMembers = true;
    } else {
      this.noMembers = false;
    }
  }

  /**
   * Calls a method in firebaseService to update channel members.
   * This function is called then user clicks on button.
   */
  async addMemberToChannel() {
    const channelDoc = await this.firebaseService.getDocument(
      'channels',
      this.channel.id
    );

    const existingMembers = channelDoc.data()?.['members'] ?? [];
    await this.firebaseService.updateDocument('channels', this.channel.id, {
      members: [...existingMembers, ...this.chosenUsers],
    });

    this.closeDialog();
  }

  /**
   * Filters and displays users based on the input value, excluding already chosen members.
   * It sets the search flags and the filtered users list, then filters users not in `chosenUsers`.
   * Matching users (by name) are logged and added to `filteredUsers`.
   */
  searchInUsers() {
    this.inputOnSearch = true;
    this.search = true;
    this.filteredUsers = [];

    const availableUsers: any[] = [];

    this.users.forEach((user) => {
      const matchingMember = this.channel.members.find(
        (member: { id: any }) => member.id === user.id
      );
      if (!matchingMember) {
        availableUsers.push(user);
      }
    });
    this.checkIfUser(availableUsers);

    this.filteredUsers = availableUsers.filter((user: any) =>
      user.fullName.toLowerCase().includes(this.userInputValue.toLowerCase())
    );
  }

  /**
   * Handles user selection from the filtered list.
   * Marks the user as checked, removes them from the filtered list, and adds them to `chosenUsers` and `users`.
   * It then refreshes the search to update the filtered users list.
   *
   * @param {string} id - The ID of the selected user.
   */
  selectedUser(id: string) {
    this.checked = true;
    const userIndex = this.filteredUsers.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      const selectedUser = this.filteredUsers.splice(userIndex, 1)[0];
      this.chosenUsers.push(selectedUser);

      // Remove the selected user from this.users array
      const userToRemoveIndex = this.users.findIndex((user) => user.id === id);
      if (userToRemoveIndex !== -1) {
        this.users.splice(userToRemoveIndex, 1);
      }
    }
    this.searchInUsers();
  }

  /**
   * Removes a member from the selected members list and adds them back to the general users list.
   *
   * @param {string} id - The ID of the member to remove.
   */
  removeMember(id: string) {
    const filter = this.chosenUsers.filter((user) => {
      if (user.id !== id) {
        return user;
      }
      this.users.push(user);
    });

    this.chosenUsers = filter;
  }
  /**
   * Fetches all users from the database and updates the local array of users.
   * It then checks for users to determine if `noMembers` should be set.
   * Errors during fetch are logged to the console.
   */
  setUser() {
    this.firebaseService
      .getAllUsers()
      .then((users: any[]) => {
        this.users = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }
  /**
   * Closes the current dialog window.
   */
  closeDialog() {
    this.dialogRef.close();
  }
}
