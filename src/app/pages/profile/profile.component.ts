import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../core/services/storageService/storage.service';
import { HttpService } from '../../core/services/http/http.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { ROLES, Rol, Usuario, Producto } from '../../core/models/interfaces';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

declare var bootstrap: any;

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
  private confirmModal: any;
  private deleteModal: any;
  loadingDelete = false;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private httpService: HttpService,
    private toastService: ToastService,
    private router: Router
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

    // Inicializar los modales
    const modalRolEl = document.getElementById('confirmRolModal');
    const modalDeleteEl = document.getElementById('confirmDeleteModal');
    if (modalRolEl) {
      this.confirmModal = new bootstrap.Modal(modalRolEl);
    }
    if (modalDeleteEl) {
      this.deleteModal = new bootstrap.Modal(modalDeleteEl);
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

  mostrarModalEliminar(): void {
    this.deleteModal.show();
  }

  confirmarEliminarCuenta(): void {
    if (!this.usuario?.id || this.loadingDelete) return;

    this.loadingDelete = true;

    // Si es vendedor, primero eliminamos sus productos
    if (this.usuario.rol?.nombre === 'VENDEDOR') {
      this.httpService.getProductosPorUsuario(this.usuario.id).subscribe({
        next: (productos) => {
          const eliminaciones = productos.map(producto =>
            this.httpService.eliminarProducto(producto.id!)
          );

          // Ejecutar todas las eliminaciones de productos
          forkJoin(eliminaciones).subscribe({
            next: () => this.procederConEliminacionCuenta(),
            error: (error) => {
              console.error('Error al eliminar productos:', error);
              this.loadingDelete = false;
              this.toastService.show('Error al eliminar los productos', 'error');
            }
          });
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
          this.loadingDelete = false;
          this.toastService.show('Error al obtener los productos', 'error');
        }
      });
    } else {
      // Si no es vendedor, procedemos directamente con la eliminación de la cuenta
      this.procederConEliminacionCuenta();
    }
  }

  private procederConEliminacionCuenta(): void {
    if (!this.usuario?.id) return;

    this.httpService.eliminarUsuario(this.usuario.id).subscribe({
      next: () => {
        this.loadingDelete = false;
        this.deleteModal.hide();
        this.toastService.show('Cuenta eliminada correctamente', 'success');
        this.storageService.eliminarUsuario();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loadingDelete = false;
        console.error('Error al eliminar la cuenta:', error);
        this.toastService.show('Error al eliminar la cuenta', 'error');
      }
    });
  }

  onRolChange(event: any): void {
    const nuevoRolId = parseInt(event.target.value);
    const rolActual = this.usuario?.rol?.id;

    // Si está cambiando de VENDEDOR a CLIENTE, mostrar modal de confirmación
    if (rolActual === ROLES.VENDEDOR && nuevoRolId === ROLES.CLIENTE) {
      this.confirmModal.show();
      // Revertir el cambio en el select hasta que confirme
      this.profileForm.patchValue({ rolId: ROLES.VENDEDOR }, { emitEvent: false });
    }
  }

  confirmarCambioRol(): void {
    // Solo cambiamos el valor del select, el proceso real se hará al guardar
    this.profileForm.patchValue({ rolId: ROLES.CLIENTE });
    this.confirmModal.hide();
  }

  private actualizarEstadoProductos(publicado: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.usuario?.id) {
        resolve();
        return;
      }

      this.httpService.getProductosPorUsuario(this.usuario.id).subscribe({
        next: (productos) => {
          if (productos.length === 0) {
            resolve();
            return;
          }

          const actualizaciones = productos.map(producto => {
            return this.httpService.actualizarProducto(producto.id!, {
              nombre: producto.nombre,
              descripcion: producto.descripcion,
              precio: producto.precio,
              stock: producto.stock,
              imagenUrl: producto.imagenUrl,
              publicado: publicado,
              categoriaId: producto.categoriaId
            });
          });

          forkJoin(actualizaciones).subscribe({
            next: () => resolve(),
            error: (error) => reject(error)
          });
        },
        error: (error) => reject(error)
      });
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.usuario) {
      this.loading = true;

      const datosActualizados = {
        ...this.profileForm.value,
        id: this.usuario.id
      };

      const nuevoRolId = parseInt(datosActualizados.rolId);
      const rolActual = this.usuario.rol?.id;

      // Primero actualizamos el perfil
      this.httpService.actualizarUsuario(datosActualizados).subscribe({
        next: (response: Usuario) => {
          // Si hay cambio de rol, actualizamos los productos
          if (rolActual !== nuevoRolId) {
            // Si cambia a cliente, despublicamos
            if (nuevoRolId === ROLES.CLIENTE) {
              this.actualizarEstadoProductos(false)
                .then(() => {
                  this.finalizarActualizacion(response, 'Perfil actualizado y productos despublicados correctamente');
                })
                .catch(error => {
                  console.error('Error al despublicar productos:', error);
                  this.toastService.show('Error al despublicar los productos', 'error');
                  this.loading = false;
                });
            }
            // Si cambia a vendedor, publicamos
            else if (nuevoRolId === ROLES.VENDEDOR) {
              this.actualizarEstadoProductos(true)
                .then(() => {
                  this.finalizarActualizacion(response, 'Perfil actualizado y productos publicados correctamente');
                })
                .catch(error => {
                  console.error('Error al publicar productos:', error);
                  this.toastService.show('Error al publicar los productos', 'error');
                  this.loading = false;
                });
            }
          } else {
            // Si no hay cambio de rol, solo actualizamos el perfil
            this.finalizarActualizacion(response, 'Perfil actualizado correctamente');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toastService.show('Error al actualizar el perfil', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  private finalizarActualizacion(response: Usuario, mensaje: string): void {
    this.loading = false;
    this.toastService.show(mensaje, 'success');

    // Actualizamos el usuario local
    this.usuario = response;

    // Actualizamos el storage con los datos del servidor
    this.storageService.guardarUsuario(response);

    // Actualizamos el formulario con los valores del servidor
    this.profileForm.patchValue({
      nombre: response.nombre,
      apellidos: response.apellidos,
      nick: response.nick,
      email: response.email,
      direccion: response.direccion,
      rolId: response.rol.id
    });
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
