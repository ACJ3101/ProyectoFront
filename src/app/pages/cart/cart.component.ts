import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cartService/cart.service';
import { Producto } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast/toast.service';

interface ProductoCarrito extends Producto {
  cantidad: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  imports: [CommonModule, FormsModule]
})
export class CartComponent implements OnInit {
  carrito: ProductoCarrito[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.actualizarCarrito();
    this.cartService.carrito$.subscribe(() => {
      this.actualizarCarrito();
    });
  }

  actualizarCarrito(): void {
    this.carrito = this.cartService.obtenerCarrito().map(item => ({
      ...item.producto,
      cantidad: item.cantidad
    }));
    this.total = this.cartService.obtenerTotal();
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    if (cantidad > 0) {
      const actualizado = this.cartService.actualizarCantidad(productoId, cantidad);
      if (!actualizado) {
        this.toastService.show('No se puede actualizar la cantidad. Excede el stock disponible.', 'error');
        this.actualizarCarrito();
      }
    }
  }

  eliminar(productoId: number): void {
    this.cartService.eliminarProducto(productoId);
  }

  vaciar(): void {
    this.cartService.limpiarCarrito();
  }

  continuarComprando(): void {
    this.router.navigate(['/shop/home']);
  }

  finalizarCompra(): void {
    if (this.carrito.length === 0) {
      this.toastService.show('El carrito está vacío', 'error');
      return;
    }

    // Redirigir al checkout con los datos necesarios
    this.router.navigate(['/checkout'], {
      queryParams: {
        total: this.total,
        productos: JSON.stringify(this.carrito)
      }
    });
  }

  obtenerSubtotal(producto: ProductoCarrito): number {
    return producto.precio * producto.cantidad;
  }
}
