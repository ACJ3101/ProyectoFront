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
  private totalSubject = new BehaviorSubject<number>(0);

  carrito$ = this.carritoSubject.asObservable();
  cantidad$ = this.cantidadSubject.asObservable();
  total$ = this.totalSubject.asObservable();

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
    this.totalSubject.next(this.calcularTotal());
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }
  }

  private calcularCantidadTotal(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  private calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  }

  agregarProducto(producto: Producto, cantidad: number): boolean {
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
    const nuevaCantidad = cantidadActual + cantidad;

    // Verificar si la nueva cantidad excede el stock
    if (nuevaCantidad > producto.stock) {
      return false;
    }

    if (itemExistente) {
      itemExistente.cantidad = nuevaCantidad;
    } else {
      this.carrito.push({ producto, cantidad });
    }

    this.actualizarCarrito();
    return true;
  }

  eliminarProducto(productoId: number): void {
    this.carrito = this.carrito.filter(item => item.producto.id !== productoId);
    this.actualizarCarrito();
  }

  actualizarCantidad(productoId: number, cantidad: number): boolean {
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (item && cantidad > 0 && cantidad <= item.producto.stock) {
      item.cantidad = cantidad;
      this.actualizarCarrito();
      return true;
    }
    return false;
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.actualizarCarrito();
  }

  obtenerCarrito(): { producto: Producto, cantidad: number }[] {
    return this.carrito;
  }

  obtenerTotal(): number {
    return this.calcularTotal();
  }

  obtenerCantidadTotal(): number {
    return this.calcularCantidadTotal();
  }

  obtenerCantidadProducto(productoId: number): number {
    const item = this.carrito.find(item => item.producto.id === productoId);
    return item ? item.cantidad : 0;
  }
}
