import { Component, HostListener, OnInit, inject } from '@angular/core';
import { DialogInputComponent } from '../dialog-input/dialog-input.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../../models/channel.class';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
  imports: [
    CommonModule,
    DialogInputComponent,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    NgIf,
    FormsModule,
    NgFor,
    MatExpansionModule,
    MatTooltipModule,
  ],
})
export class DialogAddUserComponent implements OnInit {
  officeTeam: string = 'OfficeTeam';
  channelName: string = '';
  description: string = 'Name eingeben';
  search: boolean = false;
  checked: boolean = false;
  choose: string = 'choose';
  all: string = 'all';
  choosen!: string;
  showInput: boolean = false;
  userInputValue: string = '';
  inputOnSearch: boolean = false;
  placeholder: string = 'Mitglied suchen!';

  firestore: Firestore = inject(Firestore);
  users: any[] = [];
  user: any[] = [];
  filteredUsers: any[] = [];
  chosenUsers: any[] = [];

  private channelInfoSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private dataService: DataService
  ) {
    this.channelInfoSubscription =
      this.dataService.currentChannelInfo.subscribe((channelInfo) => {
        if (channelInfo) {
          this.channelName = channelInfo.channelName;
          this.description = channelInfo.description;
        }
      });
  }

  ngOnInit(): void {
    this.setUsers();
  }

  setUsers() {
    const usersLocalStorage = localStorage.getItem('users');
    const userLocalStorage = localStorage.getItem('loggedInUser');

    if (usersLocalStorage && userLocalStorage) {
      const users = JSON.parse(usersLocalStorage);
      const user = JSON.parse(userLocalStorage);

      users.forEach((user: any) => {
        this.users.push(user);
      });
      this.user.push(user);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('mat-expansion-panel') &&
      !target.closest('#inputField') &&
      !target.closest('app-dialog-input') &&
      !target.closest('mat-icon')
    ) {
      this.inputOnSearch = false;
    }
  }

  onChange() {
    if (this.choosen == 'all') {
      this.resetArrays();
      this.checked = true;
      this.showInput = false;
      this.search = false;
    } else if (this.choosen == 'choose') {
      this.resetArrays();
      this.showInput = true;
      this.checked = false;
    }
  }

  resetArrays() {
    this.chosenUsers = [];
    this.filteredUsers = [];
    this.users = [];
    this.setUsers();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  searchInUsers() {
    this.inputOnSearch = true;
    this.search = true;
    this.filteredUsers = [];

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

  async createChannel() {
    const userLocalStorage = localStorage.getItem('loggedInUser');
    const usersLocalStorage = localStorage.getItem('users');
    const [users, user] = this.fromLocalStorage(
      usersLocalStorage,
      userLocalStorage
    );

    if (this.choosen === 'all') {
      if (this.users !== null && this.user !== null) {
        const channel = this.createNewChannel(users, user);
        await this.saveChannelToFirestore(channel);
      }
    } else {
      const channel = this.createNewChannel(this.chosenUsers, user);
      await this.saveChannelToFirestore(channel);
    }

    this.onNoClick();
  }

  createNewChannel(users: any, user: any) {
    const channel = new Channel({
      name: this.channelName,
      description: this.description,
      creator: user,
      members: users,
    });
    return channel;
  }

  closeUserDialog() {
    this.search = false;
  }

  fromLocalStorage(usersStorage: any, userStorage: any) {
    const users = JSON.parse(usersStorage);
    const user = JSON.parse(userStorage);
    return [users, user];
  }

  async saveChannelToFirestore(channel: any) {
    const toJsonChannel = channel.toJSON();

    try {
      const itemCollection = collection(this.firestore, 'channels');
      const newDocRef = await addDoc(itemCollection, toJsonChannel);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  ngOnDestroy(): void {
    this.channelInfoSubscription.unsubscribe();
  }
}
