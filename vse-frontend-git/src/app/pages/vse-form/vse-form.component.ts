import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { VseService } from '../../services/vse.service';

@Component({
  selector: 'app-vse-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './vse-form.component.html',
})
export class VseFormComponent {

  vse = {
    employeeId: '',
    goalsAchieved: '',
    selfRating: '',
    year: new Date().getFullYear()
  };

  constructor(
    public router: Router,
    private vseService: VseService
  ) {}

  submit() {
  this.vseService.create(this.vse).subscribe({
    next: () => {
      alert('Saved successfully');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error(err);
      alert('Save failed');
    }
  });
}
}
