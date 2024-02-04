import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HoverChangeDirective } from '../../../../directives/hover-change.directive';
import { InputComponent } from "../../input/input.component";
import { SearchbarComponent } from "../../searchbar/searchbar.component";

@Component({
    selector: 'app-dialog-add-member-channel',
    standalone: true,
    templateUrl: './dialog-add-member-channel.component.html',
    styleUrl: './dialog-add-member-channel.component.scss',
    imports: [HoverChangeDirective, MatCardModule, MatDialogModule, MatIconModule, InputComponent, SearchbarComponent]
})
export class DialogAddMemberChannelComponent {
  availableUserChoosen: boolean = false;
  constructor(public dialogRef: MatDialogRef<DialogAddMemberChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

  room = this.data[0];

  closeDialog(){
    this.dialogRef.close();
  }
}
