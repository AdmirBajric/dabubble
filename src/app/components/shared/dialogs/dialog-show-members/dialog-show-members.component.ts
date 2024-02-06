import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { ButtonFunctionService } from '../../../../services/button-function.service';
// import { Room } from '../../../../models/collection.class';

// ************************************************************* interface in collection.class.ts korrekt anlegen********
interface Member {
  fullName: string;
  avatar: string;
  email: string;
  isOnline: boolean;
}

interface Room {
  name: string;
  description: string;
  members: Member[];
  id: number;
}
// ############################################################### DUMMY DATA END

@Component({
  selector: 'app-dialog-show-members',
  standalone: true,
  imports: [CommonModule, HoverChangeDirective, MatCardModule, MatIconModule, MatDialogModule],
  templateUrl: './dialog-show-members.component.html',
  styleUrl: './dialog-show-members.component.scss'
})
export class DialogShowMembersComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DialogShowMembersComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private btnService: ButtonFunctionService){
  }
  room = this.data[0];

  ngOnInit(): void {
      console.log(this.room.members);
  }

  closeDialog(){
    this.dialogRef.close();
  }

  showMemberProfile(m: Member[]){
    this.btnService.openProfile(m);
  }

  openDialogAddingMember(){
    this.closeDialog();
    this.btnService.addMember(this.room);
  }
}
