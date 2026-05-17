import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get role(): string | null { return this.auth.getUserRole(); }
  get username(): string { return localStorage.getItem('username') || 'User'; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
