import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from '../../input/input.component';
import { SearchbarComponent } from '../../searchbar/searchbar.component';
import { Observable, of } from 'rxjs';
import { NgIf, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogUserListComponent } from './user-list/user-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';
import { Firestore } from '@angular/fire/firestore';

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
    this.setInputControl();
    this.setUserAndChannels();
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

  addUser(userId: any) {
    const selectedUserIndex = this.users.findIndex(
      (user) => user.id === userId
    );
    if (selectedUserIndex !== -1) {
      const selectedUser = this.users.splice(selectedUserIndex, 1)[0];
      this.showUserInput.push('@' + selectedUser.fullName);
      this.form.get('userInput')?.setValue(this.showUserInput.join(' ') + ' ');
      this.usersSearch = false;
      this.setFocusToInput();
    }
  }

  setFocusToInput() {
    const inputElement = document.getElementById(
      'userInput'
    ) as HTMLInputElement;
    if (inputElement) {
      if (this.showUserInput.length > 0) {
        this.showUserInput.push(' ');
      }
      inputElement.focus();
    }
  }

  setInputControl() {
    this.form = this.formBuilder.group({
      userInput: [''],
    });
    const inputControl = this.form.get('userInput');
    if (inputControl) {
      inputControl.valueChanges.subscribe((value) => {
        this.text = value;

        const values = value.split(' ');

        values.forEach((value: string) => {
          if (value === '@' && this.users.length > 0) {
            this.usersSearch = true;
          } else {
            this.usersSearch = false;
          }
        });
      });
    }
  }

  setUserAndChannels() {
    this.firebaseService
      .getAllUsers()
      .then((users: any[]) => {
        this.users = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
