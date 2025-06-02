import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../core/services/order/order.service';
import { StorageService } from '../../core/services/storageService/storage.service';
import { Router } from '@angular/router';
import { HttpService } from '../../core/services/http/http.service';
import { Producto } from '../../core/models/interfaces';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: (Order & { mostrarDetalles?: boolean; productos?: Producto[] })[] = [];
  loading: boolean = true;
  usuarioId: number | null = null;

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    const usuario = this.storageService.getUsuario();
    if (!usuario || !usuario.id) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.usuarioId = usuario.id;
    this.cargarPedidos();
  }

  toggleDetalles(order: Order & { mostrarDetalles?: boolean; productos?: Producto[] }): void {
    if (!order.productos) {
      // Si aún no tenemos los productos, los cargamos
      this.cargarProductosPedido(order);
    }
    order.mostrarDetalles = !order.mostrarDetalles;
  }

  private cargarProductosPedido(order: Order & { mostrarDetalles?: boolean; productos?: Producto[] }): void {
    // Obtener los productos del pedido
    const productosPromises = order.productoIds.map(id =>
      this.httpService.getProductoPorId(id).toPromise()
    );

    Promise.all(productosPromises)
      .then(productos => {
        order.productos = productos.filter(p => p !== null) as Producto[];
      })
      .catch(error => {
        console.error('Error al cargar los productos del pedido:', error);
      });
  }

  private cargarPedidos(): void {
    if (!this.usuarioId) return;

    this.loading = true;
    this.orderService.getUserOrders(this.usuarioId).subscribe({
      next: (orders: Order[]) => {
        this.orders = orders.map(order => ({
          ...order,
          mostrarDetalles: false
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar los pedidos:', error);
        this.loading = false;
      }
    });
  }
}
