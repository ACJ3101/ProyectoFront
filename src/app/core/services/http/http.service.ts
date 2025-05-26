import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, Usuario, Categoria } from '../../models/interfaces';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = 'http://localhost:8080/api'; // Cambia si usas otro puerto

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

  getUsuarios(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`, {
      headers: this.authHeaders(token)
    });
  }

  getUsuarioPorEmail(email: string): Observable<Usuario> {
    const token = this.getToken();
    const headers = this.authHeaders(token);
    const emailCodificado = encodeURIComponent(email);
    return this.http.get<Usuario>(
      `${this.baseUrl}/usuarios/buscarPorEmail?email=${emailCodificado}`,
      { headers }
    );
  }

  getUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/me`, {
      headers: this.authHeaders(this.getToken())
    });
  }

  private getToken(): string {
    const token = localStorage.getItem('token');
    return token || '';
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>('http://localhost:8080/api/usuarios/crearUsuario', usuario)
  }

  // ----------------------------
  // 🛍️ PRODUCTOS
  // ----------------------------

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  getProductosPorUsuario(usuarioId: number, token: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/usuario/${usuarioId}`, {
      headers: this.authHeaders(this.getToken())
    });
  }

  crearProducto(data: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, data, {
      headers: this.authHeaders(token)
    });
  }

  actualizarProducto(id: number, data: any, token: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/productos/${id}`, data, {
      headers: this.authHeaders(token)
    });
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
    const token = this.getToken();
    const headers = this.authHeaders(token);

    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`, {
      headers: headers
    });
  }

  // ----------------------------
  // ⚙️ UTILIDAD
  // ----------------------------

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
