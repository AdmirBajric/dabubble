import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from '../../input/input.component';
import { SearchbarComponent } from '../../searchbar/searchbar.component';
import { NgIf, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogUserListComponent } from './user-list/user-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
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
  form!: FormGroup;
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
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
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

  checkIfUser(): void {
    if (this.users.length === 0) {
      this.noMembers = true;
    } else {
      this.noMembers = false;
    }
  }

  addMemberToChannel() {
    this.firebaseService.updateDocument('channels', this.channel.id, {
      members: [...this.channel.members, ...this.chosenUsers],
    });
    this.closeDialog();
  }

  searchInUsers() {
    this.checkIfUser();
    this.inputOnSearch = true;
    this.search = true;
    this.filteredUsers = [];

    this.channel.members.forEach((member: { id: any }) => {
      this.users = this.users.filter((user) => user.id !== member.id);
    });

    this.users.filter((user) => {
      if (
        user.fullName.toLowerCase().includes(this.userInputValue.toLowerCase())
      ) {
        this.filteredUsers.push(user);
      }
    });
  }

  selectedUser(id: string) {
    this.checked = true;
    const filter = this.filteredUsers.filter((user) => {
      if (user.id != id) {
        return user;
      }
      this.chosenUsers.push(user);
    });

    this.filteredUsers = filter;
    this.users = filter;
  }

  removeMember(id: string) {
    const filter = this.chosenUsers.filter((user) => {
      if (user.id !== id) {
        return user;
      }
      this.users.push(user);
    });

    this.chosenUsers = filter;
  }

  setUser() {
    this.firebaseService
      .getAllUsers()
      .then((users: any[]) => {
        this.users = users;
        this.checkIfUser();
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
