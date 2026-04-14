import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',   // 👈 MUST MATCH HTML
  standalone: true,
  imports: [MatListModule, MatExpansionModule, RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  opened = true;

  toggle() {
    this.opened = !this.opened;
  }

  constructor(private auth: AuthService) {}

get role() {
  return this.auth.getUserRole();
}

}
