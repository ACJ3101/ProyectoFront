import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../../core/services/http/http.service';
import { Categoria } from '../../../core/models/interfaces';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-nav mb-3">
      <div class="d-flex align-items-center mb-2">
        <i class="bi bi-grid me-2"></i>
        <h6 class="mb-0">Categorías</h6>
      </div>
      <div class="nav nav-pills nav-fill flex-row flex-md-column">
        <button class="nav-link btn-sm mb-md-1 me-1 me-md-0"
                [class.active]="categoriaSeleccionada === null"
                (click)="seleccionarCategoria(null)">
          Todas
        </button>
        <button *ngFor="let categoria of categorias"
                class="nav-link btn-sm mb-md-1 me-1 me-md-0"
                [class.active]="categoriaSeleccionada === categoria.id"
                (click)="seleccionarCategoria(categoria.id)">
          {{ categoria.nombre }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .category-nav {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .nav-link {
      color: #495057;
      padding: 0.4rem 0.8rem;
      margin: 1px 0;
      transition: all 0.2s;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .nav-link:hover {
      background-color: #e9ecef;
      transform: translateX(3px);
    }

    .nav-link.active {
      background-color: #0d6efd;
      color: white;
    }

    @media (max-width: 768px) {
      .category-nav {
        padding: 0.75rem;
      }

      .nav-link:hover {
        transform: translateY(-2px);
      }
    }
  `]
})
export class CategoryNavComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaSeleccionada: number | null = null;
  @Output() categoriaChange = new EventEmitter<number | null>();

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.http.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  seleccionarCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    this.categoriaChange.emit(categoriaId);
  }
}
