import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from "../../../services/route.service";
@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  position: number = 1;
  img = [
    '../../assets/img/logo-mobile.svg',
    '../../assets/img/logo-desktop.svg',
  ];

  constructor(private routeService: RouteService) { }
  isActiveRoute(route: string): boolean {
    return this.routeService.checkRoute(route);
  }

  windowWidth: number = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth <= 1100) {
      this.position = 0;
    } else {
      this.position = 1;
    }
  }
}
