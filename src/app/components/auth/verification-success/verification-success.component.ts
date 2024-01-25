import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LogoComponent } from '../../shared/logo/logo.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [MatCardModule, LogoComponent, RouterLink],
  templateUrl: './verification-success.component.html',
  styleUrl: './verification-success.component.scss',
})
export class VerificationSuccessComponent {}
