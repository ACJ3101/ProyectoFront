import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaymentSession {
  sessionId: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la clave pública para el procesamiento de pagos
   */
  getPublicKey(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/pago/public-key`);
  }

  /**
   * Crea una nueva sesión de pago
   * @param monto - Monto a pagar
   * @param nombreProducto - Nombre del producto
   */
  createPaymentSession(monto: number, nombreProducto: string): Observable<PaymentSession> {
    const params = new HttpParams()
      .set('monto', monto.toString())
      .set('nombreProducto', nombreProducto);

    console.log(params);
    return this.http.post<PaymentSession>(`${this.baseUrl}/pago/crear-sesion`, null, { params });
  }

  /**
   * Verifica el estado del pago
   * @param sessionId - ID de la sesión de pago
   */
  verifyPaymentStatus(sessionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pago/verificar/${sessionId}`);
  }
}
