import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storageService/storage.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  return storageService.usuario$.pipe(
    map(usuario => {
      if (usuario?.rol?.nombre === 'ADMIN') {
        return true;
      }

      router.navigate(['/home']);
      return false;
    })
  );
};
