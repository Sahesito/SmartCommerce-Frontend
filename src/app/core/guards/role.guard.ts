import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Verifica que el usuario tenga el rol permitido para acceder a la ruta
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const allowedRoles: string[] = route.data?.['roles'] ?? [];
    const userRole = authService.userRole;

    if (!authService.isLoggedIn) {
        router.navigate(['/auth/login']);
        return false;
    }

    if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
        return true;
    }

    // Si no tiene el rol, va al dashboard
    router.navigate(['/dashboard']);
    return false;
};