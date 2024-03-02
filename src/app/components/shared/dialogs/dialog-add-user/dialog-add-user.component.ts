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
import { chatNavigationService } from '../../../../services/chat-navigation.service';

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

  /**
   * Subscribes to `currentChannelInfo` from `dataService` to get updates on channel information.
   */
  constructor(
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private dataService: DataService,
    private navService: chatNavigationService
  ) {
    this.channelInfoSubscription =
      this.dataService.currentChannelInfo.subscribe((channelInfo) => {
        if (channelInfo) {
          this.channelName = channelInfo.channelName;
          this.description = channelInfo.description;
        }
      });
  }
  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Sets up the initial list of users from local storage.
   */
  ngOnInit(): void {
    this.setUsers();
  }
  /**
   * Retrieves and sets users from local storage to populate the component's user lists.
   */
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
  /**
   * Closes the dialog when the user clicks outside specific elements.
   * @param {MouseEvent} event -  mouse event triggered by clicking.
   */
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
  /**
   * Handles changes in the user selection mode (all users or choose users).
   */
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

  /**
   * Resets user arrays and repopulates the general user list from local storage.
   */
  resetArrays() {
    this.chosenUsers = [];
    this.filteredUsers = [];
    this.users = [];
    this.setUsers();
  }

  /**
   * Closes the dialog without any further action.
   */
  onNoClick() {
    this.dialogRef.close();
  }

  /**
   * Filters users based on the input value and updates the list of filtered users.
   */
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

  /**
   * Selects a user from the filtered list and updates the chosen and user lists accordingly.
   * @param {string} id The ID of the selected user.
   */
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

  /**
   * Removes a user from the list of chosen members and adds them back to the general user list.
   * @param {string} id The ID of the member to remove.
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
   * Creates a new chat channel and saves it to Firestore based on the current selection of users.
   */
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

  /**
   * Constructs a new `Channel` object with the provided users and user details.
   * @param {Array} users The list of users to include in the channel.
   * @param {Object} user The user creating the channel.
   * @returns {Channel} The new channel object.
   */
  createNewChannel(users: any, user: any) {
    const channel = new Channel({
      name: this.channelName,
      description: this.description,
      creator: user,
      members: users,
    });
    return channel;
  }

  /**
   * Closes the user dialog and resets the search state.
   */
  closeUserDialog() {
    this.search = false;
  }

  /**
   * Parses user and users data from local storage.
   * @param {string} usersStorage - stored users string.
   * @returns {Array} - containing the parsed users and user.
   */
  fromLocalStorage(usersStorage: any, userStorage: any) {
    const users = JSON.parse(usersStorage);
    const user = JSON.parse(userStorage);
    return [users, user];
  }

  /**
   * Saves the provided channel to Firestore and navigates to the newly created channel.
   * @param {Channel} channel The channel to save.
   */
  async saveChannelToFirestore(channel: any) {
    const toJsonChannel = channel.toJSON();

    try {
      const itemCollection = collection(this.firestore, 'channels');
      const newDocRef = await addDoc(itemCollection, toJsonChannel);
      channel.id = newDocRef.id;
      this.navService.openChannel(channel);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  /**
   * Lifecycle hook that cleans up the component by unsubscribing from  subscriptions.
   */
  ngOnDestroy(): void {
    this.channelInfoSubscription.unsubscribe();
  }
}
