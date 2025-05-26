import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../../core/services/http/http.service';
import { StorageService } from '../../../core/services/storageService/storage.service';
import { AuthResponse } from '../../../core/models/access-token';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  formSubmitted = false;
  errorMessage = false;
  isVisible = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private storageService: StorageService,
    public router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [true]
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const EMAIL = localStorage.getItem('lastEmail');
      if (EMAIL) {
        this.loginForm.patchValue({ email: EMAIL, rememberMe: true });
      }
    }
  }

  changeVisible(): void {
    this.isVisible = !this.isVisible;
  }

  login(): void {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = false;

    this.httpService.login(email, password).subscribe({
      next: (authResponse: AuthResponse) => {
        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem('email', email);
          } else {
            localStorage.setItem("rememberMe", "");
            localStorage.removeItem('email');
          }
        }

        this.storageService.guardarToken(authResponse.accessToken);
        this.storageService.guardarRefreshToken(authResponse.refreshToken);

        this.httpService.getUsuarioActual().subscribe({
          next: (usuario) => {
            this.storageService.guardarUsuario(usuario);
            this.router.navigate(['/home']);
          },
          error: () => {
            alert('Error al obtener los datos del usuario');
          }
        });
      },
      error: () => {
        this.errorMessage = true;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
