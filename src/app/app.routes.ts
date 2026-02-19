import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },

    // Rutas públicas — sin layout
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

    // Rutas protegidas — con layout (navbar + sidebar)
    {
        path: '',
        loadComponent: () =>
            import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'shop',
                loadComponent: () =>
                    import('./pages/shop/shop.component').then(m => m.ShopComponent)
            },
            {
                path: 'users',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () =>
                    import('./pages/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'products',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'SELLER'] },
                loadComponent: () =>
                    import('./pages/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'inventory',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'SELLER'] },
                loadComponent: () =>
                    import('./pages/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'orders',
                loadComponent: () =>
                    import('./pages/orders/orders.component').then(m => m.OrdersComponent)
            },
            {
                path: 'payments',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'CLIENT'] },
                loadComponent: () =>
                    import('./pages/payments/payments.component').then(m => m.PaymentsComponent)
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'auth/login'
    }
];