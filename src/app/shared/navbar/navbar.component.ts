import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storageService/storage.service';
import { CartService } from '../../core/services/cartService/cart.service';
import { log } from 'console';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  usuarioNombre: string | null = null;
  usuarioRol: string = 'Invitado';
  carritoCantidad: number = 0;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.storageService.usuario$.subscribe(usuario => {
      this.usuarioNombre = usuario?.nick || null;
      this.usuarioRol = usuario?.rol?.nombre || 'Invitado';
      console.log(this.usuarioRol);
    });

    this.cartService.carrito$.subscribe(carrito => {
      this.carritoCantidad = carrito.length;
    });
  }

  logout(): void {
    this.storageService.eliminarUsuario();
    this.router.navigate(['/auth/login']);
  }

  estaLogueado(): boolean {
    return !!this.usuarioNombre;
  }
}
