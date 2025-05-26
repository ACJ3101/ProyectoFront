import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../core/services/http/http.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-homeProduct',
  templateUrl: './homeProduct.component.html',
  styleUrls: ['./homeProduct.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class HomeProductComponent implements OnInit {

  productos: Producto[] = [];
  categoriaSeleccionada: number = 1; // Por defecto, o puedes leerlo desde el router

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.cargarProductos(this.categoriaSeleccionada);
  }

  cargarProductos(categoriaId: number): void {

    this.httpService.getProductos().subscribe({
      next: (res) => this.productos = res,
      error: () => alert('Error al cargar productos')
    });
  }
}
