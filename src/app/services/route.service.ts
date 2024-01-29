import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class RouteService {
    constructor(private router: Router) { }
    checkRoute(route: string): boolean {
        return this.router.url === route;
    }

}