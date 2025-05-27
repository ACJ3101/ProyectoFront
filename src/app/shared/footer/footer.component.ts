import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer mt-auto py-4 bg-light">
      <div class="container">
        <div class="row g-4 justify-content-between">
          <!-- Logo y descripción -->
          <div class="col-md-5">
            <h5 class="mb-3">CrochetManía</h5>
            <p class="text-muted mb-3">
              Tu tienda online de artículos de crochet hechos a mano con amor y dedicación.
            </p>
          </div>

          <!-- Contacto -->
          <div class="col-md-5">
            <ul class="list-unstyled mb-0">
              <li class="mb-2 text-muted">
                <i class="bi bi-geo-alt me-2"></i>
                Calle Principal 123, Madrid
              </li>
              <li class="mb-2 text-muted">
                <i class="bi bi-envelope me-2"></i>
                info&#64;crochetmania.com
              </li>
              <li class="mb-2 text-muted">
                <i class="bi bi-telephone me-2"></i>
                +34 912 345 678
              </li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-top mt-4 pt-4 text-center text-muted">
          <small>© 2024 CrochetManía. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .list-unstyled li {
      transition: transform 0.2s ease;
    }

    .list-unstyled li:hover {
      transform: translateX(5px);
    }
  `]
})
export class FooterComponent {}
