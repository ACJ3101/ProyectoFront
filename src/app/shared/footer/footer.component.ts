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
        <div class="row g-4">
          <!-- Columna 1: Logo y descripción -->
          <div class="col-md-4">
            <h5 class="mb-3">CrochetManía</h5>
            <p class="text-muted mb-3">
              Tu tienda online de artículos de crochet hechos a mano con amor y dedicación.
            </p>
            <div class="social-links">
              <a href="#" class="me-3 text-dark">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="me-3 text-dark">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="#" class="me-3 text-dark">
                <i class="bi bi-twitter"></i>
              </a>
              <a href="#" class="text-dark">
                <i class="bi bi-pinterest"></i>
              </a>
            </div>
          </div>

          <!-- Columna 2: Enlaces rápidos -->
          <div class="col-md-2">
            <h6 class="mb-3">Enlaces</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/home" class="text-decoration-none text-muted">Inicio</a>
              </li>
              <li class="mb-2">
                <a routerLink="/shop/home" class="text-decoration-none text-muted">Tienda</a>
              </li>
              <li class="mb-2">
                <a routerLink="/blog" class="text-decoration-none text-muted">Blog</a>
              </li>
              <li class="mb-2">
                <a routerLink="/contact" class="text-decoration-none text-muted">Contacto</a>
              </li>
            </ul>
          </div>

          <!-- Columna 3: Categorías -->
          <div class="col-md-2">
            <h6 class="mb-3">Categorías</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/shop/home" class="text-decoration-none text-muted">Amigurumis</a>
              </li>
              <li class="mb-2">
                <a routerLink="/shop/home" class="text-decoration-none text-muted">Ropa</a>
              </li>
              <li class="mb-2">
                <a routerLink="/shop/home" class="text-decoration-none text-muted">Accesorios</a>
              </li>
              <li class="mb-2">
                <a routerLink="/shop/home" class="text-decoration-none text-muted">Decoración</a>
              </li>
            </ul>
          </div>

          <!-- Columna 4: Contacto -->
          <div class="col-md-4">
            <h6 class="mb-3">Contacto</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <i class="bi bi-geo-alt me-2"></i>
                Calle Principal 123, Madrid, España
              </li>
              <li class="mb-2">
                <i class="bi bi-envelope me-2"></i>
                info&#64;crochetmania.com
              </li>
              <li class="mb-2">
                <i class="bi bi-telephone me-2"></i>
                +34 912 345 678
              </li>
              <li class="mb-2">
                <i class="bi bi-clock me-2"></i>
                Lun - Vie: 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <!-- Línea divisoria -->
        <hr class="my-4">

        <!-- Copyright -->
        <div class="row align-items-center">
          <div class="col-md-6 text-center text-md-start">
            <small class="text-muted">
              © 2024 CrochetManía. Todos los derechos reservados.
            </small>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small>
              <a href="#" class="text-decoration-none text-muted me-3">Política de Privacidad</a>
              <a href="#" class="text-decoration-none text-muted">Términos y Condiciones</a>
            </small>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .social-links a {
      font-size: 1.25rem;
      transition: color 0.3s ease;
    }

    .social-links a:hover {
      color: var(--bs-primary) !important;
    }

    a {
      transition: color 0.3s ease;
    }

    a:hover {
      color: var(--bs-primary) !important;
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
