import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerOrAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.hasAnyRole('admin', 'manager')) {
    // Redirect users without admin or manager role to projects page
    router.navigate(['/projects']);
    return false;
  }

  return true;
};
