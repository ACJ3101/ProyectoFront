import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Order {
  id: number;
  usuarioId: number;
  estado: string;
  total: number;
  fecha: Date;
  productoIds: number[];
}

export interface CreateOrderRequest {
  usuarioId: number;
  estado: string;
  total: number;
  productoIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo pedido
   */
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/pedidos`, orderData);
  }

  /**
   * Obtiene los pedidos de un usuario
   */
  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/pedidos/usuario/${userId}`);
  }

  /**
   * Obtiene un pedido específico
   */
  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/pedidos/${orderId}`);
  }

  /**
   * Actualiza el estado de un pedido
   */
  updateOrderStatus(orderId: number, estado: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/pedidos/${orderId}/estado`, { estado });
  }
}
