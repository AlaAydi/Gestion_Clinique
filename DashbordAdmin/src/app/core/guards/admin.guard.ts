import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  if (token && role === 'ADMIN') {
    return true;
  }

  router.navigate(['/auth/signin']); 
  return false;
};
