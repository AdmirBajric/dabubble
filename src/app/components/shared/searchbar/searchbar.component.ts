import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
  @Input() placeholder!: string;  // gives placeholder according to component: if it's used in /dashboard or /new-message
  @Input() showLoupe!: boolean;   // true if it's in /dashboard; false if it's in /new-message
  @Input() showBorder!: boolean; // true if it's in /new-message (.border-light); false if it's in dashboard (.border-white)

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
