import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { HoverChangeDirective } from "../../../directives/hover-change.directive";
@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [HoverChangeDirective,MatInputModule, MatFormFieldModule, MatIconModule, MatDividerModule, MatButtonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  
  placeholder:string = "Nachricht an #Entwicklerteam";


}
