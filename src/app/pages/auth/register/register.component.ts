import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

   email?: string;
  password?: string;
  confirmPassword?: string;

  constructor() {}

  register() {
    console.log(this.email);
    console.log(this.password);
  }
}
