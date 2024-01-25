import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent {

  searchTerm!: string;
  filteredUserArray: any[] = [];
  filteredChannelsArray: any[] = [];

  constructor() {

  }

  search() {

  }

  selectUserSearchfield(username: string) {

  }

  selectChannelSearchfield(channelName: string) {

  }


}
