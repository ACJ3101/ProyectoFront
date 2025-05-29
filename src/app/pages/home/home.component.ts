import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../core/services/http/http.service';
import { Producto } from '../../core/models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  productosDestacados: Producto[] = [];
  cargando: boolean = true;
  error: boolean = false;

  constructor(
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.cargarProductosDestacados();
  }

  cargarProductosDestacados(): void {
    this.cargando = true;
    this.error = false;

    this.httpService.getProductos().subscribe({
      next: (productos) => {
        // Filtrar productos publicados y ordenar por calidad
        this.productosDestacados = productos
          .filter(p => p.publicado)
          .sort((a, b) => (b.calidad || 0) - (a.calidad || 0))
          .slice(0, 3); // Tomar los 3 mejores
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos destacados:', error);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/default-product.jpg';
  }

  getStarsArray(count: number): number[] {
    return Array(Math.round(count)).fill(0);
  }
}
