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
  todosLosProductos: Producto[] = [];

  constructor(
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.httpService.getProductos().subscribe({
      next: (productos) => {
        this.todosLosProductos = productos.filter(p => p.publicado);
        this.actualizarProductosDestacados();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  private actualizarProductosDestacados(): void {
    if (this.todosLosProductos.length === 0) return;

    // Filtrar productos que tienen calificación
    const productosConCalificacion = this.todosLosProductos.filter(p => p.calidad !== null);

    if (productosConCalificacion.length === 0) {
      // Si no hay productos calificados, mostrar los 3 primeros productos disponibles
      this.productosDestacados = this.todosLosProductos.slice(0, 3);
      return;
    }

    // Ordenar productos por calificación de mayor a menor
    const productosOrdenados = productosConCalificacion.sort((a, b) => {
      if (b.calidad === null) return -1;
      if (a.calidad === null) return 1;
      return b.calidad - a.calidad;
    });

    // Tomar los 3 productos con mejor calificación
    this.productosDestacados = productosOrdenados.slice(0, 3);
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/placeholder.jpg';
  }


  getStarsArray(count: number): number[] {
    return Array(Math.max(0, Math.floor(count))).fill(0);
  }
}
