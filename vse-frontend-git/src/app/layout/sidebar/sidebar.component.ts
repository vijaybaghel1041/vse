import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  opened = true;

  constructor(private auth: AuthService) {}

  toggle() {
    this.opened = !this.opened;
  }

  get role(): string | null {
    return this.auth.getUserRole();
  }
}
