import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../../models/interfaces';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private carrito: { producto: Producto, cantidad: number }[] = [];
  private carritoSubject = new BehaviorSubject<{ producto: Producto, cantidad: number }[]>([]);
  private cantidadSubject = new BehaviorSubject<number>(0);

  carrito$ = this.carritoSubject.asObservable();
  cantidad$ = this.cantidadSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        this.carrito = JSON.parse(carritoGuardado);
        this.actualizarCarrito();
      }
    }
  }

  private actualizarCarrito(): void {
    this.carritoSubject.next(this.carrito);
    this.cantidadSubject.next(this.calcularCantidadTotal());
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }
  }

  private calcularCantidadTotal(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  agregarProducto(producto: Producto, cantidad: number): void {
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      this.carrito.push({ producto, cantidad });
    }

    this.actualizarCarrito();
  }

  eliminarProducto(productoId: number): void {
    this.carrito = this.carrito.filter(item => item.producto.id !== productoId);
    this.actualizarCarrito();
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (item) {
      item.cantidad = cantidad;
      this.actualizarCarrito();
  }
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.actualizarCarrito();
  }

  obtenerCarrito(): { producto: Producto, cantidad: number }[] {
    return this.carrito;
  }

  obtenerCantidadTotal(): number {
    return this.calcularCantidadTotal();
  }
}
