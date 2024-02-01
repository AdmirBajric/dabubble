import {
  Component,
  ElementRef,
  AfterViewInit,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../input/input.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { getAuth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    InputComponent,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements AfterViewInit {
  userImg: string = '../../assets/img/person.svg';
  userFullName: string = '';
  userEmail: string = '';
  nameValid: boolean = false;
  emailValid: boolean = false;
  constructor(
    public router: Router,
    private dataService: DataService,
    private elementRef: ElementRef,
    public dialogRef: MatDialogRef<ProfileEditComponent>,
    private firestore: Firestore = inject(Firestore)
  ) {}

  ngAfterViewInit() {
    const inputElement =
      this.elementRef.nativeElement.querySelectorAll('input');
    if (inputElement) {
      inputElement.forEach((input: any) => {
        input.setAttribute('tabindex', '-1');
      });
    }
  }

  ngOnInit(): void {
    this.dataService.currentUserId.subscribe((userId) => {
      if (userId) {
        this.showUserDetails(userId);
      }
    });
  }

  showUserDetails(userId: string) {
    const allUsers = localStorage.getItem('users');
    if (allUsers) {
      const users = JSON.parse(allUsers);
      users.forEach((user: any) => {
        if (user.id === userId) {
          this.userImg = user.avatar;
          this.userFullName = user.fullName;
          this.userEmail = user.email;
        }
      });
    }
  }

  onValidityChanged(field: string, isValid: boolean) {
    switch (field) {
      case 'name':
        this.nameValid = isValid;
        break;
      case 'email':
        this.emailValid = isValid;
        break;
    }
  }

  async saveUser() {
    const newFullName = this.createFullName(this.userFullName);
    const newEmail = this.userEmail.toLowerCase();

    const loggedInUserString = localStorage.getItem('loggedInUser');
    const loggedInUser = loggedInUserString
      ? JSON.parse(loggedInUserString)
      : null;

    if (loggedInUser) {
      loggedInUser.fullName = newFullName;
      loggedInUser.email = newEmail;
    }

    const saveUserToLOcalStorage = {
      fullName: newFullName,
      email: newEmail,
      ...(loggedInUser || {}),
    };

    localStorage.setItem(
      'loggedInUser',
      JSON.stringify(saveUserToLOcalStorage)
    );

    const auth = getAuth();
    await this.saveUserToFirebase(
      auth.currentUser?.uid,
      saveUserToLOcalStorage
    );

    setTimeout(() => {
      this.onNoClick();
    }, 500);
  }

  async saveUserToFirebase(id: any, user: any) {
    const userProfileCollection = collection(this.firestore, 'users');
    const q = query(userProfileCollection, where('id', '==', id));
    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(userProfileCollection, userDoc.id);
        await updateDoc(userDocRef, user);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        const snapshot = await getDocs(userProfileCollection);
        const allUsersData: any[] = [];
        snapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          allUsersData.push(userData);
        });
        localStorage.setItem('users', JSON.stringify(allUsersData));
        location.reload();
      } else {
        console.log('User with ID not found');
      }
    } catch (error) {
      console.error('Error retrieving user documents:', error);
    }
  }

  createFullName(fullName: string) {
    let firstName = fullName.split(' ')[0];
    let lastName = fullName.split(' ')[1];

    firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
