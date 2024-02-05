import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent {
  @Input() placeholder!: string;                  //***** gives placeholder according to component: if it's used in /dashboard or /new-message
  @Input() showLoupe!: boolean;                   //****** true if it's in /dashboard; false if it's in /new-message
  @Input() showBorder!: boolean;                  //******  true if it's in /new-message (.border-light); false if it's in dashboard (.border-white)


  /**
   * The following 2 booleans are to regulate the functionality of searchbar.
   * @type {!boolean}
   */
  @Input() globalSearch!: boolean;                //****** true if searchbar is used globally for channels, members, messages, information
  @Input() potentialMembersSearch!: boolean;      //*** true if searchbar is used to search for specific users. It must be users that can be added to a certain channel

  /**
   * Sends data as userList to parent component: dialog-add-member-channel to display search results in parent component.
   * @type {EventEmitter<any[]>}
   */
  @Output() userListForAddingChannel: EventEmitter<any[]> = new EventEmitter<any[]>();

  /**
   * Sends boolean to parent component: dialog-add-member-channel. If the inputfield of this component is empty, 
   * the parent component should not display anything in container. 
   * @type {EventEmitter<boolean>}
   */
  @Output() inputChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  /**
   * This boolean brings the information of event (inputChange) to the parent element.
   * If true = parent element does not display results
   * if false = parent element displays results 
   * @date 2/4/2024 - 5:45:15 PM
   *
   * @type {boolean}
   */
  isSearchbarEmpty: boolean = true;

  /* Julius*/
  searchTerm!: string;
  filteredUserArray: any[] = [];
  filteredChannelsArray: any[] = [];

  constructor() {

  }

  search() {

  }


  /**
   * Calls the function according to the intention of search. It can be:
   * 1. globalSearch:boolean -> to search for buzzwords, channels, members, information
   * 2. potentialMembersSearch:boolean -> only to search for members that can be added to a specific channel. It is used in /dialog-add-member.-channel
   *
   * @param {*} event
   */
  onInput(event: any) {
    if (this.globalSearch && !this.potentialMembersSearch) {
      this.search();
    } else if (this.potentialMembersSearch && !this.globalSearch) {
      this.searchAvailableUsers();
      this.onInputChange(event);
    }
  }
  /**
   * Handles the input change event. Retrieves the input value from the event target. The event target is the input field.
   * Updates the boolean flag based on the inpout value.
   * Emits the updated boolean flag through the inputChange event.
   * @returns {*}
   */
  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.isSearchbarEmpty = !inputValue || inputValue.trim() === '';
    this.inputChange.emit(this.isSearchbarEmpty);
  }

  selectUserSearchfield(username: string) {

  }

  selectChannelSearchfield(channelName: string) {

  }


  /**
   * Searches for available users to add to a channel.
   * - Fetches a list of available users.
   * - Filters out users that are already in the channel.
   * - Emits the list of available users to be added to the channel.  
   */
  searchAvailableUsers() {
    //  this.search(); 
    // we need to push all the available users 2  filteredUserArray that are not in the channeln already.
    // push the results to filteredUserToAdd which is Output of searchbar component. 
    // we need this data in: add member to channel in /chat-header
    const userList = [
      {
        fullName: 'Hannah Arendt',
        avatar: '../../../../assets/img/avatar2.svg',
        email: 'arendt@test.de',
        isOnline: false,
      },
      {
        fullName: 'Julia Schmitz',
        avatar: '../../../../assets/img/avatar2.svg',
        email: '../julia@schmitz.de',
        isOnline: true,
      },
      {
        fullName: 'Margret Heine',
        avatar: '../../../../assets/img/avatar2.svg',
        email: 'Heine@test.de',
        isOnline: false,
      },
      {
        fullName: 'Admir Bajric',
        avatar: '../../../../assets/img/avatar2.svg',
        email: 'test@admir.de',
        isOnline: false,
      }
    ];
    this.userListForAddingChannel.emit(userList);
  }


}
