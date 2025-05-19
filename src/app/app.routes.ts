import { PAGES_ROUTES } from './pages/pages.routes';
import { Routes } from '@angular/router';

export const routes: Routes = [
   {
    path: '',
    loadChildren: () =>import('./pages/pages.routes').then(m => m.PAGES_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
