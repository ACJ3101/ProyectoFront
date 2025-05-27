import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../core/services/http/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto, Usuario, Comentario } from '../../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cartService/cart.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { StorageService } from '../../../core/services/storageService/storage.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent]
})
export class ProductComponent implements OnInit {
  producto!: Producto;
  vendedor: Usuario | null = null;
  cantidad: number = 1;
  comentarios: Comentario[] = [];
  nuevoComentario: string = '';
  calificacion: number = 5;
  hoverCalificacion: number = 0;
  usuarioActual: Usuario | null = null;
  procesandoCarrito: boolean = false;
  cantidadEnCarrito: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private cartService: CartService,
    private toastService: ToastService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.storageService.obtenerUsuario();
    const id = this.route.snapshot.params['id'];
    this.cargarProducto(id);
    this.cargarComentarios(id);
    this.actualizarCantidadEnCarrito();
  }

  private actualizarCantidadEnCarrito(): void {
    if (this.producto?.id) {
      this.cantidadEnCarrito = this.cartService.obtenerCantidadProducto(this.producto.id);
    }
  }

  cargarProducto(id: number): void {
    this.http.getProductoPorId(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cargarVendedor(producto.usuarioId);
      },
      error: (error) => {
        console.error('Error al cargar el producto:', error);
        this.toastService.show('Error al cargar el producto', 'error');
      }
    });
  }

  cargarVendedor(id: number): void {
    this.http.getUsuarioPorId(id).subscribe({
      next: (vendedor) => {
        this.vendedor = vendedor;
      },
      error: (error) => {
        console.error('Error al cargar el vendedor:', error);
      }
    });
  }

  cargarComentarios(productoId: number): void {
    this.http.getComentariosPorProducto(productoId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
        this.actualizarCalidadProducto();
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
      }
    });
  }

  private actualizarCalidadProducto(): void {
    if (this.comentarios.length > 0) {
      const sumaCalificaciones = this.comentarios.reduce((sum, comment) => sum + comment.calificacion, 0);
      this.producto.calidad = Math.round(sumaCalificaciones / this.comentarios.length);
    } else {
      this.producto.calidad = null;
    }
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

    const comentario: Comentario = {
      comentario: this.nuevoComentario.trim(),
      calificacion: this.calificacion,
      usuarioId: this.usuarioActual.id!,
      usuarioNick: this.usuarioActual.nick,
      productoId: this.producto.id!
    };

    this.http.crearComentario(comentario).subscribe({
      next: () => {
        this.toastService.show('Comentario publicado correctamente', 'success');
        this.nuevoComentario = '';
        this.calificacion = 5;
        this.cargarComentarios(this.producto.id!);
        },
      error: (error: unknown) => {
        console.error('Error al publicar el comentario:', error);
        this.toastService.show('Error al publicar el comentario', 'error');
      }
    });
  }

  eliminarComentario(comentarioId: number): void {
    if (!this.usuarioActual) {
      return;
    }

    this.http.eliminarComentario(comentarioId).subscribe({
      next: () => {
        this.toastService.show('Comentario eliminado correctamente', 'success');
        this.cargarComentarios(this.producto.id!);
      },
      error: (error) => {
        console.error('Error al eliminar el comentario:', error);
        this.toastService.show('Error al eliminar el comentario', 'error');
      }
    });
  }

  puedeEliminarComentario(comentario: Comentario): boolean {
    return this.usuarioActual?.id === comentario.usuarioId;
  }

  getEstrellas(calificacion: number): string[] {
    return Array(5).fill(0).map((_, index) =>
      index < calificacion ? 'bi-star-fill' : 'bi-star');
  }

  incrementarCantidad(): void {
    if (this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito(): void {
    if (this.cantidad > 0 &&
        this.cantidad <= this.producto.stock &&
        (this.cantidadEnCarrito + this.cantidad) <= this.producto.stock) {

      this.procesandoCarrito = true;

      try {
        this.cartService.agregarProducto(this.producto, this.cantidad);
        this.toastService.show(`Se añadió ${this.cantidad} ${this.cantidad === 1 ? 'unidad' : 'unidades'} al carrito`, 'success');
        this.actualizarCantidadEnCarrito();
      } catch (error) {
        this.toastService.show('Error al añadir al carrito', 'error');
      } finally {
        this.procesandoCarrito = false;
      }
    } else {
      this.toastService.show('No hay suficiente stock disponible', 'error');
    }
  }
}
