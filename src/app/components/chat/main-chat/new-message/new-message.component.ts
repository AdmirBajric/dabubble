import { Component, Output } from '@angular/core';
import { MessageInputComponent } from "../../../shared/message-input/message-input.component";
import { InputComponent } from "../../../shared/input/input.component";
import { SearchbarComponent } from "../../../shared/searchbar/searchbar.component";
import { RouteService } from "../../../../services/route.service";
import { CommonModule } from "@angular/common";
@Component({
    selector: 'app-new-message',
    standalone: true,
    templateUrl: './new-message.component.html',
    styleUrl: './new-message.component.scss',
    imports: [CommonModule, MessageInputComponent, InputComponent, SearchbarComponent]
})
export class NewMessageComponent {
    @Output() inputPlaceholder: string = 'An: #channel, oder @jemand oder E-Mail Adresse';
    constructor(private routeService: RouteService) { }

    get isNotDashboard() {
        return !this.routeService.checkRoute('/dashboard');
    }
}
