import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../core/services/storageService/storage.service';
import { HttpService } from '../../core/services/http/http.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { ROLES, Rol, Usuario } from '../../core/models/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  loadingPassword = false;
  showPassword = false;
  ROLES = ROLES;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private httpService: HttpService,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      nick: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      rolId: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.usuario = this.storageService.obtenerUsuario();
    if (this.usuario) {
      this.profileForm.patchValue({
        nombre: this.usuario.nombre,
        apellidos: this.usuario.apellidos,
        nick: this.usuario.nick,
        email: this.usuario.email,
        direccion: this.usuario.direccion,
        rolId: this.usuario.rol?.id || ROLES.CLIENTE
      });
    }
  }

  getRoleBadgeClass(): string {
    if (this.usuario?.rol?.id === ROLES.VENDEDOR) {
      return 'bg-success';
    }
    return 'bg-primary';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.usuario) {
      this.loading = true;

      const datosActualizados = {
        ...this.profileForm.value,
        id: this.usuario.id
      };

      this.httpService.actualizarUsuario(datosActualizados).subscribe({
        next: (response: Usuario) => {
          this.loading = false;
          this.toastService.show('Perfil actualizado correctamente', 'success');

          // Usamos directamente la respuesta del servidor para actualizar el usuario
          const usuarioActualizado: Usuario = {
            id: response.id,
            nombre: response.nombre,
            apellidos: response.apellidos,
            nick: response.nick,
            email: response.email,
            direccion: response.direccion,
            rol: response.rol
          };

          // Actualizamos el usuario local
          this.usuario = usuarioActualizado;

          // Actualizamos el storage con los datos del servidor
          this.storageService.guardarUsuario(usuarioActualizado);

          // Actualizamos el formulario con los valores del servidor
          this.profileForm.patchValue({
            nombre: response.nombre,
            apellidos: response.apellidos,
            nick: response.nick,
            email: response.email,
            direccion: response.direccion,
            rolId: response.rol.id
          });
        },
        error: (error) => {
          this.loading = false;
          this.toastService.show('Error al actualizar el perfil', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid && this.usuario?.id) {
      this.loadingPassword = true;
      this.httpService.cambiarContrasena(this.usuario.id, this.passwordForm.value.nuevaContrasena)
        .subscribe({
          next: () => {
            this.loadingPassword = false;
            this.passwordForm.reset();
            this.toastService.show('Contraseña actualizada correctamente', 'success');
          },
          error: (error) => {
            this.loadingPassword = false;
            this.toastService.show('Error al actualizar la contraseña', 'error');
            console.error('Error:', error);
          }
        });
    }
  }
}
