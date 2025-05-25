import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PublicacionBlog, Usuario } from '../../core/models/interfaces';

@Component({
  selector: 'app-blog',
  standalone: true,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
  imports:[CommonModule]
})
export class BlogComponent implements OnInit {

  publicaciones: PublicacionBlog[] = [];

  ngOnInit(): void {
    // Simulación de datos (puedes reemplazar por llamada HTTP en el futuro)
    const autor: Usuario = {
      nombre: 'Ana',
      apellidos: 'Tejeda',
      nick: 'anaCrochet',
      email: '',
      direccion: '',
      contraseña: '',
      rol: { id: 2 }
    };

    this.publicaciones = [
      {
        id: 1,
        titulo: 'Cómo empecé con el crochet',
        contenido: 'Empecé hace 3 años con un ovillo y mucha curiosidad...',
        fechaPublicacion: new Date().toISOString(),
        autor
      },
      {
        id: 2,
        titulo: 'Hilos recomendados para principiantes',
        contenido: 'Si estás empezando, elige algodón peinado o hilo acrílico...',
        fechaPublicacion: new Date().toISOString(),
        autor
      }
    ];
  }
}
