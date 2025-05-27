import { Component, OnInit } from '@angular/core';
import { Producto, Usuario } from '../../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../core/services/http/http.service';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cartService/cart.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { CategoryNavComponent } from '../category-nav/category-nav.component';
import { StorageService } from '../../../core/services/storageService/storage.service';

@Component({
  selector: 'app-homeProduct',
  templateUrl: './homeProduct.component.html',
  styleUrls: ['./homeProduct.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, CategoryNavComponent],
  standalone: true
})
export class HomeProductComponent implements OnInit {
  productos: (Producto & { cantidad: number })[] = [];
  todosLosProductos: (Producto & { cantidad: number })[] = [];
  categoriaSeleccionada: number | null = null;
  cargando: boolean = true;
  usuarioActual: Usuario | null = null;

  constructor(
    private httpService: HttpService,
    private cartService: CartService,
    private toastService: ToastService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.storageService.obtenerUsuario();
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.httpService.getProductos().subscribe({
      next: (res) => {
        this.todosLosProductos = res
          .filter(producto => producto.publicado)
          .map(producto => ({
            ...producto,
            cantidad: 1
          }));
        this.filtrarProductos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.toastService.show('Error al cargar los productos', 'error');
        this.cargando = false;
      }
    });
  }

  onCategoriaChange(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    this.filtrarProductos();
  }

  private filtrarProductos(): void {
    if (this.categoriaSeleccionada === null) {
      this.productos = [...this.todosLosProductos];
    } else {
      this.productos = this.todosLosProductos.filter(
        p => p.categoriaId === this.categoriaSeleccionada
      );
    }
  }

  incrementarCantidad(producto: Producto & { cantidad: number }): void {
    if (producto.cantidad < producto.stock) {
      producto.cantidad++;
    }
  }

  decrementarCantidad(producto: Producto & { cantidad: number }): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  agregarAlCarrito(producto: Producto & { cantidad: number }): void {
    if (producto.cantidad > 0 && producto.cantidad <= producto.stock) {
      this.cartService.agregarProducto(producto, producto.cantidad);
      this.toastService.show(`Se añadió ${producto.cantidad} ${producto.cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} al carrito`, 'success');
    }
  }

  getStarsArray(count: number): number[] {
    return Array(Math.max(0, Math.floor(count))).fill(0);
  }
}
