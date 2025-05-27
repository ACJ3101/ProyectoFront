import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../core/services/http/http.service';
import { Publicacion, Usuario, PublicacionRequest } from '../../core/models/interfaces';
import { StorageService } from '../../core/services/storageService/storage.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';

declare var bootstrap: any;

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  usuarioActual: Usuario | null = null;
  cargando: boolean = true;
  error: string | null = null;

  // Variables para el modal
  nuevaPublicacion: PublicacionRequest = {
    titulo: '',
    contenido: '',
    categoria: 'General',
    autorId: 0
  };
  guardando: boolean = false;

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

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  puedeEditar(publicacion: Publicacion): boolean {
    return this.usuarioActual?.id === publicacion.autorId;
  }

  prepararNuevaPublicacion(): void {
    if (this.usuarioActual) {
      this.nuevaPublicacion = {
        titulo: '',
        contenido: '',
        categoria: 'General', // Categoría por defecto
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
      next: (publicacion) => {
        this.toastService.show('Publicación creada con éxito', 'success');
        this.cargarPublicaciones(); // Recargar las publicaciones
        this.cerrarModal(); // Cerrar el modal de nueva publicación
      },
      error: (error) => {
        console.error('Error al crear la publicación:', error);
        this.toastService.show('Error al crear la publicación', 'error');
      }
    });
  }

  cerrarModal(): void {
    // Cerrar el modal
    const modalElement = document.getElementById('crearPublicacionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
