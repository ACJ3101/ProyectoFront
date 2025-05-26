import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  toasts$ = this.toastSubject.asObservable();

  constructor() {}

  show(mensaje: string, tipo: Toast['tipo'] = 'success'): void {
    const id = ++this.counter;
    const toast: Toast = { mensaje, tipo, id };
    this.toasts.push(toast);
    this.toastSubject.next(this.toasts);

    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next(this.toasts);
  }
}
