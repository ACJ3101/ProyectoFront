import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../core/services/storageService/storage.service';
import { HttpService } from '../../core/services/http/http.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { ROLES, Rol } from '../../core/models/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: any = null;
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
    this.storageService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuario = usuario;
        this.profileForm.patchValue({
          nombre: usuario.nombre || '',
          apellidos: usuario.apellidos || '',
          nick: usuario.nick || '',
          email: usuario.email || '',
          direccion: usuario.direccion || '',
          rolId: usuario.rol?.id || ROLES.CLIENTE
        });
      }
    });
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
        next: (response) => {
          this.loading = false;
          this.toastService.show('Perfil actualizado correctamente', 'success');

          // Actualizar el usuario en el storage con el nuevo rol
          const rolNombre = datosActualizados.rolId === ROLES.VENDEDOR ? 'VENDEDOR' : 'CLIENTE';
          this.storageService.guardarUsuario({
            ...this.usuario,
            ...datosActualizados,
            rol: {
              id: datosActualizados.rolId,
              nombre: rolNombre
            }
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

  onPasswordSubmit(): void {
    if (this.passwordForm.valid && this.usuario) {
      this.loadingPassword = true;
      const { nuevaContrasena } = this.passwordForm.value;

      this.httpService.cambiarContrasena(this.usuario.id, nuevaContrasena).subscribe({
        next: () => {
          // Después de cambiar la contraseña, hacemos login con las nuevas credenciales
          this.httpService.login(this.usuario.email, nuevaContrasena).subscribe({
            next: (loginResponse) => {
              this.loadingPassword = false;
              // Guardamos los nuevos tokens
              this.storageService.guardarToken(loginResponse.token);
              this.storageService.guardarRefreshToken(loginResponse.refreshToken);

              this.toastService.show('Contraseña actualizada correctamente', 'success');
              this.passwordForm.reset();
            },
            error: (loginError) => {
              this.loadingPassword = false;
              this.passwordForm.reset();
              this.toastService.show('Error al actualizar las credenciales', 'error');
              console.error('Error en login:', loginError);
            }
          });
        },
        error: (error) => {
          this.loadingPassword = false;
          this.passwordForm.reset();
          // Verificamos si es el error específico de contraseña igual
            this.toastService.show(error.error, 'error');

        }
      });
    }
  }
}
