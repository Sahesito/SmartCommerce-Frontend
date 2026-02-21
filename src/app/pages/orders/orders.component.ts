import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, OrderStatusUpdateRequest } from '../../core/models/order.model';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        SelectModule,
        SkeletonModule,
        DividerModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {

    orders: Order[] = [];
    loading = true;
    detailVisible = false;
    statusDialogVisible = false;
    saving = false;
    searchTerm = '';
    hiddenOrderIds: Set<number> = new Set();
    selectedOrder: Order | null = null;

    statusRequest: OrderStatusUpdateRequest = {
        status: 'CONFIRMED'
    };

    statusOptions = [
        { label: 'Confirmado', value: 'CONFIRMED' },
        { label: 'Enviado', value: 'SHIPPED' },
        { label: 'Entregado', value: 'DELIVERED' },
        { label: 'Cancelado', value: 'CANCELLED' }
    ];

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadHiddenOrders();
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;

        // CLIENT solo ve sus pedidos
        if (this.authService.isClient()) {
            const userId = this.authService.currentUser!.id;
            this.orderService.getByUserId(userId).subscribe({
                next: (orders) => {
                    this.orders = orders;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('No se pudieron cargar los pedidos');
                }
            });
        } else {
            // ADMIN y SELLER ven todos
            this.orderService.getAll().subscribe({
                next: (orders) => {
                    this.orders = orders;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('No se pudieron cargar los pedidos');
                }
            });
        }
    }

    loadHiddenOrders(): void {
        const stored = localStorage.getItem('hiddenOrders');
        if (stored) {
            const ids: number[] = JSON.parse(stored);
            this.hiddenOrderIds = new Set(ids);
        }
    }

    hideOrderForUser(orderId: number): void {
        this.hiddenOrderIds.add(orderId);
        localStorage.setItem('hiddenOrders',
            JSON.stringify([...this.hiddenOrderIds])
        );
    }

    openDetail(order: Order): void {
        this.selectedOrder = order;
        this.detailVisible = true;
    }

    openStatusDialog(order: Order): void {
        this.selectedOrder = order;
        this.statusRequest = { status: 'CONFIRMED' };
        this.statusDialogVisible = true;
    }

    updateStatus(): void {
        if (!this.selectedOrder) return;

        this.saving = true;
        this.orderService.updateStatus(this.selectedOrder.id, this.statusRequest).subscribe({
            next: () => {
                this.saving = false;
                this.statusDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Estado del pedido actualizado'
                });
                this.loadOrders();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Error al actualizar estado'
                });
            }
        });
    }

    confirmCancel(order: Order): void {
        this.confirmationService.confirm({
            message: `¿Cancelar el pedido #${order.id}?`,
            header: 'Confirmar cancelación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.orderService.cancel(order.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Pedido cancelado',
                            detail: `Pedido #${order.id} cancelado. Desaparecerá en 10 segundos.`
                        });

                        if (this.authService.isClient()) {
                            setTimeout(() => {
                                this.hideOrderForUser(order.id);
                                this.loadOrders();
                            }, 10000);
                        }

                        this.loadOrders();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err.error?.error || 'No se pudo cancelar'
                        });
                    }
                });
            }
        });
    }

    confirmDelete(order: Order): void {
        this.confirmationService.confirm({
            message: `¿Eliminar el pedido #${order.id}? Esta acción es permanente.`,
            header: 'Eliminar pedido',
            icon: 'pi pi-trash',
            accept: () => {
                this.orderService.delete(order.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: `Pedido #${order.id} eliminado`
                        });
                        this.loadOrders();
                    },
                    error: () => {
                        this.showError('No se pudo eliminar el pedido');
                    }
                });
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
        switch (status) {
            case 'PENDING': return 'warn';
            case 'CONFIRMED': return 'info';
            case 'SHIPPED': return 'contrast';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'CONFIRMED': return 'Confirmado';
            case 'SHIPPED': return 'Enviado';
            case 'DELIVERED': return 'Entregado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    }

    canUpdateStatus(): boolean {
        return this.authService.isAdmin() || this.authService.isSeller();
    }

    canCancel(order: Order): boolean {
        return (order.status === 'PENDING' || order.status === 'CONFIRMED') &&
            (this.authService.isAdmin() || this.authService.isClient());
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    showError(msg: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg
        });
    }

    get filteredOrders(): Order[] {
        let orders = this.orders;

        if (this.authService.isClient()) {
            orders = orders.filter(o => !this.hiddenOrderIds.has(o.id));
        }

        if (!this.searchTerm) return orders;
        return orders.filter(o =>
            o.id.toString().includes(this.searchTerm) ||
            o.userId.toString().includes(this.searchTerm) ||
            o.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
}