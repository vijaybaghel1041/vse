import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {

  username = '';
  password = '';
  email = '';
  phone = '';
  role = 'MEMBER'; // Default value for dropdown

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    console.log('--- SIGNUP INITIATED ---');
    console.log('Payload:', { username: this.username, email: this.email, role: this.role });

    this.authService.register(this.username, this.email, this.password, this.phone, this.role).subscribe({
      next: (res) => {
        console.log('SIGNUP SUCCESS:', res);
        // Automatic redirect to login page as requested
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('SIGNUP FAILED:', err);
        // Displaying specific error from backend if available
        const errorMsg = err.error?.message || 'Server error during signup. Please check logs.';
        alert('Signup failed: ' + errorMsg);
      }
    });
  }

}
