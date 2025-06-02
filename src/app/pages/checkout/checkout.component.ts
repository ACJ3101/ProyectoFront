import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment/payment.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { CartService } from '../../core/services/cartService/cart.service';

interface ProductoCheckout {
  id?: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  productos: ProductoCheckout[] = [];
  total: number = 0;
  procesando: boolean = false;
  publicKey: string = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Obtener datos de la URL
    this.route.queryParams.subscribe(params => {
      if (!params['total'] || !params['productos']) {
        this.router.navigate(['/cart']);
        return;
      }

      this.total = parseFloat(params['total']);
      this.productos = JSON.parse(params['productos']);
    });

    // Obtener la clave pública de Stripe
    this.paymentService.getPublicKey().subscribe({
      next: (key) => {
        this.publicKey = key;
      },
      error: (error) => {
        console.error('Error al obtener la clave pública:', error);

      }
    });
  }

  volverAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  iniciarPago(): void {
    if (this.procesando) return;

    this.procesando = true;
    const nombreProducto = this.productos.length === 1
      ? this.productos[0].nombre
      : `Compra de ${this.productos.length} productos`;

    this.paymentService.createPaymentSession(this.total, nombreProducto).subscribe({
      next: (session) => {
        localStorage.setItem('stripe_session_id', session.sessionId);
        localStorage.setItem('cart_data', JSON.stringify(this.productos));
        window.location.href = session.url;
      },
      error: (error) => {
        console.error('Error al crear la sesión de pago:', error);
        this.toastService.show('Error al procesar el pago', 'error');
        this.procesando = false;
      }
    });
  }

  obtenerSubtotal(producto: ProductoCheckout): number {
    return producto.precio * producto.cantidad;
  }
}
