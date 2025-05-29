import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../core/services/http/http.service';
import { ComentarioBlog, Usuario } from '../../core/models/interfaces';
import { StorageService } from '../../core/services/storageService/storage.service';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit {
  @Input() publicacionId!: number;

  comentarios: ComentarioBlog[] = [];
  usuarioActual: Usuario | null = null;
  nuevoComentario: string = '';
  cargando: boolean = false;
  error: string | null = null;

  constructor(
    private http: HttpService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.storageService.obtenerUsuario();
    this.cargarComentarios();
  }

  cargarComentarios(): void {
    this.cargando = true;
    this.error = null;

    this.http.getComentariosBlog(this.publicacionId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar los comentarios:', error);
        this.error = 'Error al cargar los comentarios. Por favor, intenta de nuevo más tarde.';
        this.cargando = false;
        this.toastService.show('Error al cargar los comentarios', 'error');
      }
    });
  }

  enviarComentario(): void {
    if (!this.usuarioActual) {
      this.toastService.show('Debes iniciar sesión para comentar', 'error');
      return;
    }

    if (!this.nuevoComentario.trim()) {
      this.toastService.show('El comentario no puede estar vacío', 'error');
      return;
    }

    const comentarioBlog: ComentarioBlog = {
      comentario: this.nuevoComentario.trim(),
      calificacion: 0,
      usuarioNick: this.usuarioActual.nick,
      publicacionId: this.publicacionId
    };

    this.http.crearComentarioBlog(comentarioBlog).subscribe({
      next: () => {
        this.nuevoComentario = '';
        this.cargarComentarios();
        this.toastService.show('Comentario publicado con éxito', 'success');
      },
      error: (error) => {
        console.error('Error al publicar el comentario:', error);
        this.toastService.show('Error al publicar el comentario', 'error');
      }
    });
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
