import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Producto, Usuario, Categoria, Comentario, Publicacion, PublicacionRequest } from '../../models/interfaces';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  // ----------------------------
  // 🔐 AUTENTICACIÓN
  // ----------------------------

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/refresh`, { refreshToken });
  }

  // ----------------------------
  // ✅ USUARIOS
  // ----------------------------

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`);
  }

  getUsuarioPorEmail(email: string): Observable<Usuario> {
    const emailCodificado = encodeURIComponent(email);
    return this.http.get<Usuario>(
      `${this.baseUrl}/usuarios/buscarPorEmail?email=${emailCodificado}`
    );
  }

  getUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${id}`);
  }

  getUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/me`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios/crearUsuario`, usuario);
  }

  actualizarUsuario(datos: {
    id: number;
    nombre: string;
    apellidos: string;
    rolId: number;
    email: string;
    direccion: string;
    nick: string;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${datos.id}`, datos);
  }

  cambiarContrasena(userId: number, nuevaContrasena: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${userId}/cambiarContrasena`, {
      nuevaContrasena
    });
  }

  // ----------------------------
  // 🛍️ PRODUCTOS
  // ----------------------------

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  getProductosPorUsuario(usuarioId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/usuario/${usuarioId}`);
  }

  crearProducto(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, data);
  }

  actualizarProducto(id: number, producto: {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenUrl: string;
    publicado: boolean;
    categoriaId: number;
  }): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/productos/${id}`);
  }

  getProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/categoria/${categoriaId}`);
  }

  getProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`);
  }

  // ----------------------------
  // 📑 CATEGORÍAS
  // ----------------------------

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  // Métodos para comentarios
  getComentarios(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.baseUrl}/comentarios`);
  }


  getComentariosPorProducto(productoId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.baseUrl}/comentarios/producto/${productoId}`);
  }

  crearComentario(comentario: Omit<Comentario, 'id' | 'usuarioNick'>): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.baseUrl}/comentarios`, comentario);
  }

  eliminarComentario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comentarios/${id}`);
  }

  // Métodos para publicaciones del blog
  getPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.baseUrl}/publicaciones`);
  }

  getPublicacionPorId(id: number): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.baseUrl}/publicaciones/${id}`);
  }

  crearPublicacion(publicacion: PublicacionRequest): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.baseUrl}/publicaciones`, publicacion);
  }

  eliminarPublicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/publicaciones/${id}`);
  }

  // Métodos adicionales del blog que podrían necesitar actualización en el futuro
  darLikePublicacion(publicacionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/publicaciones/${publicacionId}/like`, {});
  }

  quitarLikePublicacion(publicacionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/publicaciones/${publicacionId}/like`);
  }

  getComentariosPublicacion(publicacionId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.baseUrl}/publicaciones/${publicacionId}/comentarios`);
  }

  comentarPublicacion(publicacionId: number, comentario: Comentario): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.baseUrl}/publicaciones/${publicacionId}/comentarios`, comentario);
  }
}
