import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Angular imports
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) {}

login() {
  this.authService.login(this.username, this.password).subscribe({
    next: () => {
      console.log('TOKEN:', localStorage.getItem('accessToken')); // DEBUG

      const role = this.authService.getUserRole();
      if (role === 'ADMIN') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'MEMBER') {
        this.router.navigate(['/annual-submission']);
      } else if (role === 'AUDITOR') {
        this.router.navigate(['/auditor']);
      } else {
        this.router.navigate(['/']);
      }
    },
    error: () => alert('Invalid credentials')
  });
}

}
