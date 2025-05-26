import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cartService/cart.service';
import { Producto } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    private router: Router
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
    this.total = this.cartService.obtenerCantidadTotal();
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    this.cartService.actualizarCantidad(productoId, cantidad);
  }

  eliminar(index: number): void {
    this.cartService.eliminarProducto(index);
  }

  vaciar(): void {
    this.cartService.limpiarCarrito();
  }

  continuarComprando(): void {
    this.router.navigate(['/shop/home']);
  }

  finalizarCompra(): void {
    // Aquí iría la lógica para finalizar la compra
    alert('Funcionalidad de finalizar compra pendiente de implementar');
  }

  obtenerSubtotal(producto: ProductoCarrito): number {
    return producto.precio * producto.cantidad;
  }
}
