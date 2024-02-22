import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ChannelEditComponent } from '../../chat/channel/channel-edit/channel-edit.component';
import { ButtonFunctionService } from "../../../services/button-function.service";
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
import { MatDialog } from '@angular/material/dialog';
import { DialogShowMembersComponent } from '../dialogs/dialog-show-members/dialog-show-members.component';
import { chatNavigationService } from '../../../services/chat-navigation.service';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';

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
  constructor(
    private btnService: ButtonFunctionService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private dialog: MatDialog,
    private navService: chatNavigationService
  ) {
  }

  @Input() styleHeaderForThread!: boolean;
  @Output() closeThread = new EventEmitter<any[]>();
  currentChannel!: Channel;

  windowWidth!: number;
  mobileView!: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowSize();
  }
  private checkWindowSize(): void {
    this.windowWidth = this.renderer.parentNode(
      this.elementRef.nativeElement
    ).ownerDocument.defaultView.innerWidth;
    if (this.windowWidth <= 1100) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }

  async ngOnInit() {
    await this.subscribeChannel();
    this.checkWindowSize();
  }

  subscribeChannel() {
    this.navService.currentChannel.subscribe(channel => {
      this.currentChannel = channel
    })
  }

  // ######################################### Subsribe here to uptdate when adding new members ##########################
  get countMembersRoom() {
    return this.currentChannel.members.length
  }

  showMembers(channel: Channel) {
    this.btnService.showChannelMembers(channel); // passing the whole channel Object because id, members is necessary ID EXISTIERT NICHT IN CHANNEL.CLASS
  }

  addMember(channel: Channel) {
    this.btnService.addMemberDialog(channel);
  }
  /**
   * Calculates left positioning of avatar images according to i. 
   * The max display of avatars shown is three (i < 3).
   * @param {number} i
   * @returns {string}
   */
  getLeftPositioning(i: number): string {
    // const maxIndex = Math.min(i, 2);
    return `${3 * i}rem`;
  }


  openEditChannel() {
    this.btnService.openChannelDialog();
  }

  exitThread() {
    // this.closeThread.emit();
    this.navService.cloesThread();
  }

}