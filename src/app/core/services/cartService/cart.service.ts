import { Injectable } from '@angular/core';
import { Producto } from '../../models/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private carrito: Producto[] = [];
  private carritoSubject = new BehaviorSubject<Producto[]>([]);

  carrito$ = this.carritoSubject.asObservable();

  constructor() {}

  agregarProducto(producto: Producto): void {
    this.carrito.push(producto);
    this.carritoSubject.next(this.carrito);
  }

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  eliminarProducto(index: number): void {
    this.carrito.splice(index, 1);
    this.carritoSubject.next(this.carrito);
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.carritoSubject.next(this.carrito);
  }

  obtenerTotal(): number {
    return this.carrito.reduce((total, prod) => total + prod.precio, 0);
  }
}
