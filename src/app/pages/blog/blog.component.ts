import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../core/services/http/http.service';
import { Publicacion, Usuario, PublicacionRequest } from '../../core/models/interfaces';
import { StorageService } from '../../core/services/storageService/storage.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';

declare var bootstrap: any;

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent, ComentariosComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  publicacionesSinFiltrar: Publicacion[] = [];
  usuarioActual: Usuario | null = null;
  cargando: boolean = true;
  error: string | null = null;
  publicacionSeleccionada: Publicacion | null = null;
  categoriaSeleccionada: string = 'Todos';

  nuevaPublicacion: PublicacionRequest = {
    titulo: '',
    contenido: '',
    categoria: 'General',
    autorId: 0
  };

  constructor(
    private http: HttpService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.storageService.obtenerUsuario();
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.error = null;

    this.http.getPublicaciones().subscribe({
      next: (publicaciones) => {
        this.publicacionesSinFiltrar = publicaciones;
        this.publicaciones = publicaciones;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error);
        this.error = 'Error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.';
        this.cargando = false;
        this.toastService.show('Error al cargar las publicaciones', 'error');
      }
    });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;

    if (categoria === 'Todos') {
      this.publicaciones = this.publicacionesSinFiltrar;
    } else {
      this.publicaciones = this.publicacionesSinFiltrar.filter(
        pub => pub.categoria === categoria
      );
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  puedeEditar(publicacion: Publicacion): boolean {
    return this.usuarioActual?.id === publicacion.autor.id;
  }

  puedeEliminar(publicacion: Publicacion): boolean {
    if (!this.usuarioActual) return false;

    // El usuario puede eliminar si es el autor o si es admin
    return this.usuarioActual.id === publicacion.autor.id ||
           this.usuarioActual.rol?.nombre === 'ADMIN';
  }

  eliminarPublicacion(publicacion: Publicacion, event: Event): void {
    event.stopPropagation(); // Evita que se abra el modal de comentarios

    if (!this.puedeEliminar(publicacion)) {
      this.toastService.show('No tienes permisos para eliminar esta publicación', 'error');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la publicación "${publicacion.titulo}"?`)) {
      this.http.eliminarPublicacion(publicacion.id!).subscribe({
        next: () => {
          this.toastService.show('Publicación eliminada con éxito', 'success');
          this.cargarPublicaciones();
        },
        error: (error) => {
          console.error('Error al eliminar la publicación:', error);
          this.toastService.show('Error al eliminar la publicación', 'error');
        }
      });
    }
  }

  prepararNuevaPublicacion(): void {
    if (this.usuarioActual) {
      this.nuevaPublicacion = {
        titulo: '',
        contenido: '',
        categoria: 'General',
        autorId: this.usuarioActual.id!
      };
    } else {
      this.toastService.show('Debes iniciar sesión para crear una publicación', 'error');
    }
  }

  crearPublicacion(): void {
    if (!this.usuarioActual) {
      this.toastService.show('Debes iniciar sesión para crear una publicación', 'error');
      return;
    }

    if (!this.nuevaPublicacion.titulo.trim() || !this.nuevaPublicacion.contenido.trim()) {
      this.toastService.show('El título y el contenido son obligatorios', 'error');
      return;
    }

    const publicacionRequest: PublicacionRequest = {
      titulo: this.nuevaPublicacion.titulo.trim(),
      contenido: this.nuevaPublicacion.contenido.trim(),
      categoria: this.nuevaPublicacion.categoria,
      autorId: this.usuarioActual.id!
    };

    this.http.crearPublicacion(publicacionRequest).subscribe({
      next: () => {
        this.toastService.show('Publicación creada con éxito', 'success');
        this.cargarPublicaciones();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al crear la publicación:', error);
        this.toastService.show('Error al crear la publicación', 'error');
      }
    });
  }

  cerrarModal(): void {
    const modalElement = document.getElementById('crearPublicacionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  seleccionarPublicacion(publicacion: Publicacion): void {
    this.publicacionSeleccionada = publicacion;
    const modalElement = document.getElementById('verComentariosModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
