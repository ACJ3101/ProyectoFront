import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.css']
})
export class PaymentFailedComponent implements OnInit {
  errorCode: string | null = null;

  ngOnInit() {
    // Aquí se podría obtener el errorCode de los query params o del servicio
    this.errorCode = 'ERR_PAYMENT_001'; // Ejemplo
  }
}
