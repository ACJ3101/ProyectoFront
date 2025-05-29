import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  ngOnInit() {
    // Aquí se podría obtener el orderId de los query params o del servicio
    this.orderId = '123456'; // Ejemplo
  }
}
