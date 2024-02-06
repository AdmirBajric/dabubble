import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from "../../../services/button-function.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
import { MatDialog } from '@angular/material/dialog';
import { DialogShowMembersComponent } from '../dialogs/dialog-show-members/dialog-show-members.component';
// import { Room } from '../../../models/collection.class'; must wait for correction of room interface (members!) to bind in.
// That's why I use DUMMY INTERFACE here: #######################################################################
interface Room {
  name: string;
  description: string;
  members: Member[];
  id: number;
}
interface Member {
  fullName: string;
  avatar: string;
  email: string;
  isOnline: boolean;
}
// DUMMY END #######################################################################
@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [ChannelEditComponent, CommonModule, HoverChangeDirective],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  @Input() roomName!: string;
  @Input() styleHeaderForThread!: boolean;
  @Output() closeThread = new EventEmitter<any[]>();
  // @Input() room!: Room;
  room!: Room[];
  constructor(private btnService: ButtonFunctionService, private dialog: MatDialog) {
    // ############################################ DUMMY DATA BEGIN ###################
    this.room = [
      {
        name: 'Entwicklerteam',
        description: 'Ein Channel, in dem wir uns über alles zu Developement austauschen',
        id: 200,
        members: [
          {
            fullName: 'Max Mustermann',
            avatar: '../../../../assets/img/avatar2.svg',
            email: 'max@mustermann.de',
            isOnline: false,
          },
          {
            fullName: 'Julia Schmitz',
            avatar: '../../../../assets/img/avatar2.svg',
            email: '../julia@schmitz.de',
            isOnline: true,
          },
          {
            fullName: 'Tobias Müller',
            avatar: '../../../../assets/img/avatar2.svg',
            email: 'tobias@mueller.de',
            isOnline: false,
          },
          {
            fullName: 'Admir Bajric',
            avatar: '../../../../assets/img/avatar2.svg',
            email: 'test@admir.de',
            isOnline: false,
          },
        ]
      }
    ]
    // ############################################ DUMMY DATA END ############################
  }

  // ######################################### Subsribe here to uptdate when adding new members ##########################
  get countMembersRoom() {
    return this.room[0].members.length
  }

  showMembers(r: Room[]){
    this.btnService.showChannelMembers(r); // passing the whole channel Object because id, members is necessary
  }
  
  addMember(room: Room[]){
    this.btnService.addMember(room);
  }
  /**
   * Calculates left positioning of avatar images according to i. 
   * The max display of avatars shown is three (i < 3).
   * @param {number} i
   * @returns {string}
   */
  getLeftPositioning(i: number): string{
    // const maxIndex = Math.min(i, 2);
    return `${3 * i}rem`;
  }
  ngOnInit() {
  }

  openEditChannel() {
    this.btnService.openChannelDialog();
  }

  exitThread() {
    this.closeThread.emit();
  }

}