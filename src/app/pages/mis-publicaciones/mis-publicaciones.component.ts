import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../core/services/http/http.service';
import { Publicacion, Usuario } from '../../core/models/interfaces';
import { StorageService } from '../../core/services/storageService/storage.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-mis-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, ComentariosComponent],
  templateUrl: './mis-publicaciones.component.html',
  styleUrls: ['./mis-publicaciones.component.css']
})
export class MisPublicacionesComponent implements OnInit, OnDestroy {
  publicaciones: Publicacion[] = [];
  usuarioActual: Usuario | null = null;
  cargando: boolean = true;
  error: string | null = null;
  publicacionSeleccionada: Publicacion | null = null;
  private usuarioSubscription: Subscription | null = null;

  constructor(
    private http: HttpService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Nos suscribimos a los cambios del usuario
    this.usuarioSubscription = this.storageService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
      if (this.usuarioActual) {
        this.cargarMisPublicaciones();
      } else {
        this.error = 'Debes iniciar sesión para ver tus publicaciones';
        this.cargando = false;
        // Redirigir al login si no hay usuario
        this.storageService.eliminarUsuario();
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción al destruir el componente
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  cargarMisPublicaciones(): void {
    if (!this.usuarioActual?.id) return;

    this.cargando = true;
    this.error = null;

    this.http.getPublicacionesPorUsuario(this.usuarioActual.id).subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error);
        this.error = 'Error al cargar tus publicaciones. Por favor, intenta de nuevo más tarde.';
        this.cargando = false;
        this.toastService.show('Error al cargar las publicaciones', 'error');
      }
    });
  }

  eliminarPublicacion(publicacion: Publicacion, event: Event): void {
    event.stopPropagation();

    if (confirm(`¿Estás seguro de que deseas eliminar la publicación "${publicacion.titulo}"?`)) {
      this.http.eliminarPublicacion(publicacion.id!).subscribe({
        next: () => {
          this.toastService.show('Publicación eliminada con éxito', 'success');
          this.cargarMisPublicaciones();

          // Actualizamos el usuario en el storage para mantener la consistencia
          if (this.usuarioActual) {
            this.storageService.guardarUsuario(this.usuarioActual);
          }
        },
        error: (error) => {
          console.error('Error al eliminar la publicación:', error);
          this.toastService.show('Error al eliminar la publicación', 'error');
        }
      });
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

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
