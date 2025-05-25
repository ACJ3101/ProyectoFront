import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
productosDestacados = [
    {
      nombre: 'Muñeco Amigurumi',
      descripcion: 'Hecho a mano con hilo de algodón.',
      precio: 19.99,
      imagenUrl: 'https://cdn.pixabay.com/photo/2017/01/23/20/21/amigurumi-2002923_1280.jpg'
    },
    {
      nombre: 'Gorro de Crochet',
      descripcion: 'Perfecto para invierno, cálido y estiloso.',
      precio: 14.50,
      imagenUrl: 'https://cdn.pixabay.com/photo/2015/10/12/14/57/beanie-983395_1280.jpg'
    },
    {
      nombre: 'Cojín Decorativo',
      descripcion: 'Ideal para darle un toque artesanal a tu hogar.',
      precio: 22.00,
      imagenUrl: 'https://cdn.pixabay.com/photo/2017/11/11/11/55/crochet-2938453_1280.jpg'
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
