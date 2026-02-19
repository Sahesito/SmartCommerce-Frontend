import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';
import { InventoryService } from '../../core/services/inventory.service';
import { OrderService } from '../../core/services/order.service';
import { AuthResponse } from '../../core/models/user.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        TagModule,
        SkeletonModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

    currentUser: AuthResponse | null = null;
    loading = true;

    stats = {
        totalProducts: 0,
        totalUsers: 0,
        lowStockItems: 0,
        pendingOrders: 0
    };

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private userService: UserService,
        private inventoryService: InventoryService,
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;

        // Cargar productos
        this.productService.getAll().subscribe({
            next: (products) => {
                this.stats.totalProducts = products.length;
            },
            error: () => { }
        });

        // Cargar usuarios (solo ADMIN)
        if (this.authService.isAdmin()) {
            this.userService.getAll().subscribe({
                next: (users) => {
                    this.stats.totalUsers = users.length;
                },
                error: () => { }
            });
        }

        // Cargar bajo stock
        this.inventoryService.getLowStock().subscribe({
            next: (items) => {
                this.stats.lowStockItems = items.length;
            },
            error: () => { }
        });

        // Cargar pedidos pendientes
        this.orderService.getByStatus('PENDING').subscribe({
            next: (orders) => {
                this.stats.pendingOrders = orders.length;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    getRoleLabel(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'Administrador';
            case 'SELLER': return 'Vendedor';
            default: return '';
        }
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    isAdminOrSeller(): boolean {
        return this.authService.isAdminOrSeller();
    }
}