import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, CreateOrderRequest } from '../../core/services/order/order.service';
import { CartService } from '../../core/services/cartService/cart.service';
import { StorageService } from '../../core/services/storageService/storage.service';
import { PaymentService } from '../../core/services/payment/payment.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { HttpService } from '../../core/services/http/http.service';
import { StockUpdateRequest } from '../../core/models/interfaces';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string | null = null;
  currentDate: Date = new Date();
  procesando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService,
    private storageService: StorageService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private httpService: HttpService
  ) {}

  ngOnInit() {
    const sessionId = localStorage.getItem('stripe_session_id');
    const cartData = localStorage.getItem('cart_data');

    if (!sessionId || !cartData) {
      this.router.navigate(['/cart']);
      return;
    }

    this.verificarPagoYCrearPedido(sessionId, JSON.parse(cartData));
  }

  private verificarPagoYCrearPedido(sessionId: string, cartData: any[]): void {
    console.log('Verificando pago con sessionId:', sessionId);

    this.paymentService.verifyPaymentStatus(sessionId).subscribe({
      next: (response: string) => {
        console.log('Respuesta de verificación de pago:', response);

        // Eliminamos espacios en blanco y convertimos a minúsculas para una comparación más robusta
        const responseNormalized = response.trim().toLowerCase();

        if (responseNormalized.includes('pago completado correctamente')) {
          console.log('Pago verificado correctamente, procediendo a crear pedido');
          this.crearPedido(cartData);
        } else {
          console.error('Pago no completado. Respuesta:', response);
          this.toastService.show('El pago no se completó correctamente', 'error');
          this.router.navigate(['/payment-failed']);
        }
      },
      error: (error) => {
        console.error('Error al verificar el pago:', error);
        this.toastService.show('Error al verificar el estado del pago', 'error');
        this.router.navigate(['/payment-failed']);
      }
    });
  }

  private crearPedido(cartData: any[]): void {
    console.log('Iniciando creación del pedido con datos:', cartData);

    const usuario = this.storageService.getUsuario();
    if (!usuario || !usuario.id) {
      console.error('No se encontró información del usuario');
      this.router.navigate(['/auth/login']);
      return;
    }

    const total = cartData.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const productoIds = cartData.map(item => item.id);

    const orderData: CreateOrderRequest = {
      usuarioId: usuario.id,
      estado: 'PENDIENTE',
      total: total,
      productoIds: productoIds
    };

    console.log('Enviando solicitud de creación de pedido:', orderData);

    // Primero actualizamos el stock
    const stockUpdateData: StockUpdateRequest = {
      productos: cartData.map(item => ({
        productoId: item.id,
        cantidadVendida: item.cantidad
      }))
    };

    console.log('Actualizando stock de productos:', stockUpdateData);

    // Usamos forkJoin para asegurarnos de que ambas operaciones se completen
    this.httpService.actualizarStockProductos(stockUpdateData).subscribe({
      next: () => {
        console.log('Stock actualizado correctamente, procediendo a crear el pedido');

        // Una vez actualizado el stock, creamos el pedido
        this.orderService.createOrder(orderData).subscribe({
          next: (order) => {
            console.log('Pedido creado exitosamente:', order);
            this.orderId = order.id.toString();
            this.finalizarProcesoCompra('¡Pedido creado exitosamente!');
          },
          error: (error) => {
            console.error('Error al crear el pedido:', error);
            this.toastService.show('Error al procesar el pedido', 'error');
            this.procesando = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al actualizar el stock:', error);
        this.toastService.show('Error al actualizar el inventario', 'error');
        this.procesando = false;
      }
    });
  }

  private finalizarProcesoCompra(mensaje: string): void {
    this.procesando = false;
    this.limpiarDatosCompra();
    this.toastService.show(mensaje, 'success');
  }

  private limpiarDatosCompra(): void {
    localStorage.removeItem('stripe_session_id');
    localStorage.removeItem('cart_data');
    this.cartService.limpiarCarrito();
  }
}
