import { StorageService } from './../../../core/services/storageService/storage.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../core/services/http/http.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../core/models/interfaces';
import { AuthResponse } from '../../../core/models/access-token';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registroForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nickName: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      rol: ['CLIENTE', [Validators.required]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      repetirContraseña: ['', Validators.required]
    }, {
      validator: this.passwordsMatch('contraseña', 'repetirContraseña')
    });
  }

  passwordsMatch(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const password = formGroup.get(pass1);
      const confirmPassword = formGroup.get(pass2);
      if (password?.value !== confirmPassword?.value) {
        confirmPassword?.setErrors({ mismatch: true });
      } else {
        confirmPassword?.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registroForm.valid) {
      const formValue = this.registroForm.value;

      const nuevoUsuario = {
        email: formValue.email,
        nombre: formValue.nombre,
        apellidos: formValue.apellidos,
        nick: formValue.nickName,
        direccion: formValue.direccion,
        contraseña: formValue.contraseña,
        fechaRegistro: new Date().toISOString(),
        rol: {
          id: formValue.rol === 'CLIENTE' ? 1 : 2
        }
      };

      this.httpService.crearUsuario(nuevoUsuario).subscribe({
        next: () => {
          // 1. Hacer login automático
          this.httpService.login(nuevoUsuario.email, nuevoUsuario.contraseña).subscribe({
            next: (authResponse: AuthResponse) => {
              // Primero guardamos los tokens
              this.storageService.guardarToken(authResponse.accessToken);
              this.storageService.guardarRefreshToken(authResponse.refreshToken);

              // Luego obtenemos y guardamos los datos del usuario
              this.httpService.getUsuarioActual().subscribe({
                next: (usuario) => {
                  this.storageService.guardarUsuario(usuario);

                  // 2. Limpiar formulario
                  this.registroForm.reset();
                  this.submitted = false;

                  // 3. Redirigir a /home
                  this.router.navigate(['/home']);
                },
                error: () => {
                  alert('Error al obtener los datos del usuario');
                }
              });
            },
            error: () => alert('Error al iniciar sesión automáticamente')
          });
        },
        error: () => alert('Error al registrar usuario')
      });
    }
  }
}
