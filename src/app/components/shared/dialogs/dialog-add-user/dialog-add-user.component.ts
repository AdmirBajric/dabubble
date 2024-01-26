import { Component, ElementRef, ViewChild } from '@angular/core';
import { DialogInputComponent } from "../dialog-input/dialog-input.component";
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
  imports: [CommonModule, DialogInputComponent, MatDialogModule, MatCardModule, MatIconModule, MatRadioModule, NgIf, FormsModule, NgFor]
})
export class DialogAddUserComponent {

  @ViewChild('searchUser') searchUser!: ElementRef;
  ChannelName: string = "OfficeTeam";
  Description: string = "Name eingeben";
  search: boolean = false;
  checked: boolean = false;
  choose: string = "choose";
  all: string = "all";
  choosen!: string;
  showInput: boolean = false;
  addedUser!: User[];
  filteredUsers: any[] = [
    {
      id: 4,
      fullName: 'Julius Marecek',
      img: '../../assets/img/avatar3.svg',
      isOnline: false,
    },
    {
      id: 2,
      fullName: 'Admir Bajric',
      img: '../../assets/img/avatar1.svg',
      isOnline: true,
    },
    {
      id: 3,
      fullName: 'Selina Karlin',
      img: '../../assets/img/avatar2.svg',
      isOnline: false,
    },
    {
      id: 4,
      fullName: 'Julius Marecek',
      img: '../../assets/img/avatar3.svg',
      isOnline: false,
    },];

  users: any[] = [
    {
      id: 2,
      fullName: 'Admir Bajric',
      img: '../../assets/img/avatar1.svg',
      isOnline: true,
    },
    {
      id: 3,
      fullName: 'Selina Karlin',
      img: '../../assets/img/avatar2.svg',
      isOnline: false,
    },
    {
      id: 4,
      fullName: 'Julius Marecek',
      img: '../../assets/img/avatar3.svg',
      isOnline: false,
    },
    {
      id: 2,
      fullName: 'Admir Bajric',
      img: '../../assets/img/avatar1.svg',
      isOnline: true,
    },
    {
      id: 3,
      fullName: 'Selina Karlin',
      img: '../../assets/img/avatar2.svg',
      isOnline: false,
    },
    {
      id: 4,
      fullName: 'Julius Marecek',
      img: '../../assets/img/avatar3.svg',
      isOnline: false,
    },
  ];

  constructor(
    private elementRef: ElementRef,
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
  ) { }

  onChange() {
    if (this.choosen == "all") {
      this.checked = true;
      this.showInput = false;
      console.log('all', this.showInput)
    }
    else if (this.choosen == "choose") {
      this.showInput = true;
      this.checked = false;
      console.log('choose', this.showInput)
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  searchInUsers() {
    const inputValue = this.searchUser.nativeElement.querySelector('input').value;
    console.log(inputValue);
    this.filteredUsers = this.users.filter(user => {
      return user.fullName.toLowerCase().includes(inputValue);
    });
  }

  createChannel() {
    console.log('Channel erstellt');

  }
}
