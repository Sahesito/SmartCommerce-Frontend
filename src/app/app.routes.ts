import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./pages/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
            }
        ]
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'shop',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/shop/shop.component').then(m => m.ShopComponent)
    },
    {
        path: 'users',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./pages/users/users.component').then(m => m.UsersComponent)
    },
    {
        path: 'products',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'SELLER'] },
        loadComponent: () =>
            import('./pages/products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'inventory',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'SELLER'] },
        loadComponent: () =>
            import('./pages/inventory/inventory.component').then(m => m.InventoryComponent)
    },
    {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/orders/orders.component').then(m => m.OrdersComponent)
    },
    {
        path: 'payments',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'CLIENT'] },
        loadComponent: () =>
            import('./pages/payments/payments.component').then(m => m.PaymentsComponent)
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];