import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div *ngFor="let toast of toasts"
           class="toast show"
           [ngClass]="getToastClass(toast)"
           role="alert">
        <div class="toast-header">
          <i [class]="getIconClass(toast)" class="me-2"></i>
          <strong class="me-auto">{{ getTitle(toast) }}</strong>
          <button type="button"
                  class="btn-close"
                  (click)="removeToast(toast.id)">
          </button>
        </div>
        <div class="toast-body">
          {{ toast.mensaje }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      min-width: 300px;
      margin-bottom: 0.5rem;
    }
    .toast.success {
      border-left: 4px solid #198754;
    }
    .toast.error {
      border-left: 4px solid #dc3545;
    }
    .toast.warning {
      border-left: 4px solid #ffc107;
    }
    .toast.info {
      border-left: 4px solid #0dcaf0;
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getToastClass(toast: Toast): string {
    return toast.tipo;
  }

  getIconClass(toast: Toast): string {
    const iconMap = {
      success: 'bi bi-check-circle-fill text-success',
      error: 'bi bi-x-circle-fill text-danger',
      warning: 'bi bi-exclamation-triangle-fill text-warning',
      info: 'bi bi-info-circle-fill text-info'
    };
    return iconMap[toast.tipo];
  }

  getTitle(toast: Toast): string {
    const titleMap = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    return titleMap[toast.tipo];
  }
}
