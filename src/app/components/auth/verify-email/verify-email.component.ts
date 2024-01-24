import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LogoComponent } from '../../shared/logo/logo.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [MatCardModule, LogoComponent, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {}
