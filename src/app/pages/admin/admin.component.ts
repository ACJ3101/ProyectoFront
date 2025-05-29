import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../core/services/http/http.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { Usuario, ROLES, Producto, Categoria } from '../../core/models/interfaces';

declare var bootstrap: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = false;
  editandoUsuario: Usuario | null = null;
  editForm: FormGroup;
  guardando = false;
  showPassword = false;
  ROLES = ROLES;

  productos: Producto[] = [];
  loadingProductos = true;
  errorProductos = false;
  editandoProducto: Producto | null = null;
  productoForm: FormGroup;
  guardandoProducto = false;
  activeTab = 'usuarios';

  categorias: Categoria[] = [];

  usuarioAEliminar: Usuario | null = null;
  eliminandoUsuario = false;

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      nick: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      rolId: ['', Validators.required],
      nuevaContrasena: ['', [Validators.minLength(6)]]
    });

    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imagenUrl: ['', Validators.required],
      publicado: [true],
      categoriaId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = false;

    this.httpService.getUsuarios().subscribe({
      next: (usuarios) => {
        // Filtramos los usuarios, excluyendo los que tienen rol ADMIN
        this.usuarios = usuarios.filter((usuario: Usuario) => usuario.rol?.nombre !== 'ADMIN');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.editandoUsuario = usuario;
    this.editForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      nick: usuario.nick,
      email: usuario.email,
      direccion: usuario.direccion || '',
      rolId: usuario.rol?.id || 1,
      nuevaContrasena: ''
    });
  }

  cerrarModal(): void {
    this.editandoUsuario = null;
    this.editForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  guardarCambios(): void {
    if (this.editForm.valid && this.editandoUsuario) {
      this.guardando = true;
      const datosActualizados = {
        ...this.editForm.value,
        id: this.editandoUsuario.id
      };

      // Si no hay nueva contraseña, la eliminamos del objeto
      if (!datosActualizados.nuevaContrasena) {
        delete datosActualizados.nuevaContrasena;
      }

      this.httpService.actualizarUsuario(datosActualizados).subscribe({
        next: (response) => {
          this.guardando = false;
          this.toastService.show('Usuario actualizado correctamente', 'success');

          // Si hay nueva contraseña, la actualizamos
          if (datosActualizados.nuevaContrasena) {
            this.httpService.cambiarContrasena(this.editandoUsuario!.id!, datosActualizados.nuevaContrasena)
              .subscribe({
                next: () => {
                  this.toastService.show('Contraseña actualizada correctamente', 'success');
                },
                error: (error) => {
                  console.error('Error al actualizar contraseña:', error);
                  this.toastService.show('Error al actualizar la contraseña', 'error');
                }
              });
          }

          // Actualizamos la lista de usuarios
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          this.guardando = false;
          this.toastService.show('Error al actualizar el usuario', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  cargarProductos(): void {
    this.loadingProductos = true;
    this.errorProductos = false;

    this.httpService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.errorProductos = true;
        this.loadingProductos = false;
      }
    });
  }

  editarProducto(producto: Producto): void {
    this.editandoProducto = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl,
      publicado: producto.publicado,
      categoriaId: producto.categoriaId
    });
  }

  cerrarModalProducto(): void {
    this.editandoProducto = null;
    this.productoForm.reset();
  }

  guardarCambiosProducto(): void {
    if (this.productoForm.valid && this.editandoProducto) {
      this.guardandoProducto = true;
      const datosActualizados = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion,
        precio: Number(this.productoForm.value.precio),
        stock: Number(this.productoForm.value.stock),
        imagenUrl: this.productoForm.value.imagenUrl,
        publicado: this.productoForm.value.publicado,
        categoriaId: Number(this.productoForm.value.categoriaId)
      };

      this.httpService.actualizarProducto(this.editandoProducto.id!, datosActualizados).subscribe({
        next: () => {
          this.guardandoProducto = false;
          this.toastService.show('Producto actualizado correctamente', 'success');
          this.cargarProductos();
          this.cerrarModalProducto();
        },
        error: (error) => {
          this.guardandoProducto = false;
          this.toastService.show('Error al actualizar el producto', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  eliminarProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      this.httpService.eliminarProducto(producto.id!).subscribe({
        next: () => {
          this.toastService.show('Producto eliminado correctamente', 'success');
          this.cargarProductos();
        },
        error: (error) => {
          this.toastService.show('Error al eliminar el producto', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  cargarCategorias(): void {
    this.httpService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.toastService.show('Error al cargar las categorías', 'error');
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    if (usuario.rol?.nombre === 'ADMIN') {
      this.toastService.show('No se puede eliminar un usuario administrador', 'error');
      return;
    }
    this.usuarioAEliminar = usuario;
  }

  cancelarEliminacion(): void {
    this.usuarioAEliminar = null;
    this.eliminandoUsuario = false;
  }

  confirmarEliminacion(): void {
    if (!this.usuarioAEliminar) return;

    this.eliminandoUsuario = true;
    this.httpService.eliminarUsuario(this.usuarioAEliminar.id!).subscribe({
      next: () => {
        this.toastService.show('Usuario eliminado correctamente', 'success');
        this.cargarUsuarios();
        this.cancelarEliminacion();
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.toastService.show('Error al eliminar el usuario', 'error');
        this.eliminandoUsuario = false;
      }
    });
  }
}
