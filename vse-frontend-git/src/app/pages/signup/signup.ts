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

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    this.authService.register(this.username, this.email, this.password, this.phone).subscribe({
      next: () => {
        alert('Signup successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: () => alert('Signup failed')
    });
  }

}
