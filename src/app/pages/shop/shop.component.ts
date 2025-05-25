import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Producto } from '../../core/models/interfaces';
import { CartService } from '../../core/services/cartService/cart.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {

  productos:Producto[] = []


  constructor(private cartService:CartService) {}

  ngOnInit(): void {}

  agregarAlCarrito(producto: Producto): void {
  this.cartService.agregarProducto(producto);
}
}
