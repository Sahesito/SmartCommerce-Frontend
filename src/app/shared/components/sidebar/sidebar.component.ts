import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/user.model';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
    roles: string[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

    currentUser: AuthResponse | null = null;

    allMenuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            route: '/dashboard',
            roles: ['ADMIN', 'SELLER']
        },
        {
            label: 'Tienda',
            icon: 'pi pi-shopping-bag',
            route: '/shop',
            roles: ['CLIENT']
        },
        {
            label: 'Usuarios',
            icon: 'pi pi-users',
            route: '/users',
            roles: ['ADMIN']
        },
        {
            label: 'Productos',
            icon: 'pi pi-box',
            route: '/products',
            roles: ['ADMIN', 'SELLER']
        },
        {
            label: 'Inventario',
            icon: 'pi pi-warehouse',
            route: '/inventory',
            roles: ['ADMIN', 'SELLER']
        },
        {
            label: 'Pedidos',
            icon: 'pi pi-shopping-cart',
            route: '/orders',
            roles: ['ADMIN', 'SELLER', 'CLIENT']
        },
        {
            label: 'Pagos',
            icon: 'pi pi-credit-card',
            route: '/payments',
            roles: ['ADMIN', 'CLIENT']
        }
    ];

    visibleMenuItems: MenuItem[] = [];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.filterMenuByRole();
        });
    }

    filterMenuByRole(): void {
        const role = this.currentUser?.role;
        if (!role) {
            this.visibleMenuItems = [];
            return;
        }
        this.visibleMenuItems = this.allMenuItems.filter(item =>
            item.roles.includes(role)
        );
    }
}