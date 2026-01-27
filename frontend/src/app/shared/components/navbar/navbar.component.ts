import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div>
        <!-- Admin and Manager: Users, Admin only: Roles -->
        <a *ngIf="authService.hasAnyRole('admin', 'manager')" routerLink="/users" routerLinkActive="active">Users</a>
        <a *ngIf="authService.hasRole('admin')" routerLink="/roles" routerLinkActive="active">Roles</a>
        <!-- Any authenticated user can view projects -->
        <a *ngIf="authService.isAuthenticated()" routerLink="/projects" routerLinkActive="active">Projects</a>
      </div>
      <div class="navbar-right">
        <span *ngIf="authService.isAuthenticated()" style="margin-right: 20px;">
          <button class="btn btn-danger" (click)="logout()">Logout</button>
        </span>
        <span *ngIf="!authService.isAuthenticated()">
          <a routerLink="/login" routerLinkActive="active">Login</a>
          <a routerLink="/register" routerLinkActive="active">Register</a>
        </span>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
