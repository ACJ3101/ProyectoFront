import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = 'http://localhost:8080/api'; // Cambia si usas otro puerto

  constructor(private http: HttpClient) {}

  // ----------------------------
  // 🔐 AUTENTICACIÓN
  // ----------------------------

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/getAccessToken`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/refreshAccessToken`, { refreshToken });
  }

  // ----------------------------
  // ✅ USUARIOS
  // ----------------------------

  getUsuarios(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`, {
      headers: this.authHeaders(token)
    });
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
  return this.http.post<Usuario>('http://localhost:8080/api/usuarios/crearUsuario', usuario)

}


  // ----------------------------
  // 🛍️ PRODUCTOS
  // ----------------------------

  getProductos(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/productos`, {
      headers: this.authHeaders(token)
    });
  }

  crearProducto(data: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, data, {
      headers: this.authHeaders(token)
    });
  }

  // ----------------------------
  // ⚙️ UTILIDAD
  // ----------------------------

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
