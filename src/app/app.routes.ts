import { PAGES_ROUTES } from './pages/pages.routes';
import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { adminGuard } from './core/guards/admin.guard';
import { profileGuard } from './core/guards/profile.guard';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentFailedComponent } from './pages/payment-failed/payment-failed.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [
   {
    path: '',
    loadChildren: () =>import('./pages/pages.routes').then(m => m.PAGES_ROUTES),
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [profileGuard],
    title: 'Mi Perfil'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    title: 'Panel de Administración'
  },


  {
    path: '**',
    redirectTo: '',
  },
];
