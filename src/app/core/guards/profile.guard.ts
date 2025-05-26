import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storageService/storage.service';
import { map } from 'rxjs';

export const profileGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  return storageService.usuario$.pipe(
    map(usuario => {
      // Si el usuario no está logueado o es admin, redirigir a home
      if (!usuario || usuario.rol?.nombre === 'ADMIN') {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};
