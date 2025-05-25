import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cartService/cart.service';
import { Producto } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  imports:[CommonModule]
})
export class CartComponent implements OnInit {
  carrito: Producto[] = [];
  total: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.cartService.obtenerTotal();
  }

  eliminar(index: number): void {
    this.cartService.eliminarProducto(index);
    this.actualizar();
  }

  vaciar(): void {
    this.cartService.vaciarCarrito();
    this.actualizar();
  }

  actualizar(): void {
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.cartService.obtenerTotal();
  }
}
