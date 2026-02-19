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
import { InputNumberModule } from 'primeng/inputnumber';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { Payment, PaymentRequest, PaymentStatusUpdateRequest } from '../../core/models/payment.model';

@Component({
    selector: 'app-payments',
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
        DividerModule,
        InputNumberModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit {

    payments: Payment[] = [];
    loading = true;
    createDialogVisible = false;
    statusDialogVisible = false;
    detailVisible = false;
    saving = false;
    searchTerm = '';

    selectedPayment: Payment | null = null;

    paymentForm: PaymentRequest = this.emptyForm();

    statusRequest: PaymentStatusUpdateRequest = {
        status: 'COMPLETED'
    };

    paymentMethods = [
        { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
        { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
        { label: 'Transferencia', value: 'TRANSFER' },
        { label: 'Efectivo', value: 'CASH' }
    ];

    statusOptions = [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Completado', value: 'COMPLETED' },
        { label: 'Fallido', value: 'FAILED' },
        { label: 'Reembolsado', value: 'REFUNDED' }
    ];

    constructor(
        private paymentService: PaymentService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadPayments();
    }

    emptyForm(): PaymentRequest {
        return {
            orderId: 0,
            userId: 0,
            amount: 0,
            paymentMethod: '',
            description: ''
        };
    }

    loadPayments(): void {
        this.loading = true;

        // CLIENT solo ve sus pagos
        if (this.authService.isClient()) {
            const userId = this.authService.currentUser!.id;
            this.paymentService.getByUserId(userId).subscribe({
                next: (payments) => {
                    this.payments = payments;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('No se pudieron cargar los pagos');
                }
            });
        } else {
            // ADMIN ve todos
            this.paymentService.getAll().subscribe({
                next: (payments) => {
                    this.payments = payments;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('No se pudieron cargar los pagos');
                }
            });
        }
    }

    openCreate(): void {
        this.paymentForm = this.emptyForm();
        this.paymentForm.userId = this.authService.currentUser!.id;
        this.createDialogVisible = true;
    }

    openDetail(payment: Payment): void {
        this.selectedPayment = payment;
        this.detailVisible = true;
    }

    openStatusDialog(payment: Payment): void {
        this.selectedPayment = payment;
        this.statusRequest = { status: payment.status };
        this.statusDialogVisible = true;
    }

    createPayment(): void {
        if (!this.paymentForm.orderId || !this.paymentForm.amount ||
            !this.paymentForm.paymentMethod) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'ID de pedido, monto y método de pago son obligatorios'
            });
            return;
        }

        this.saving = true;
        this.paymentService.create(this.paymentForm).subscribe({
            next: (payment) => {
                this.saving = false;
                this.createDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Pago registrado',
                    detail: `Transacción ${payment.transactionId} procesada`
                });
                this.loadPayments();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Error al procesar el pago'
                });
            }
        });
    }

    updateStatus(): void {
        if (!this.selectedPayment) return;

        this.saving = true;
        this.paymentService.updateStatus(this.selectedPayment.id, this.statusRequest).subscribe({
            next: () => {
                this.saving = false;
                this.statusDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Estado del pago actualizado'
                });
                this.loadPayments();
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

    confirmDelete(payment: Payment): void {
        this.confirmationService.confirm({
            message: `¿Eliminar el pago #${payment.id}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.paymentService.delete(payment.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Pago eliminado correctamente'
                        });
                        this.loadPayments();
                    },
                    error: () => {
                        this.showError('No se pudo eliminar el pago');
                    }
                });
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
        switch (status) {
            case 'PENDING': return 'warn';
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'danger';
            case 'REFUNDED': return 'info';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'COMPLETED': return 'Completado';
            case 'FAILED': return 'Fallido';
            case 'REFUNDED': return 'Reembolsado';
            default: return status;
        }
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

    get filteredPayments(): Payment[] {
        if (!this.searchTerm) return this.payments;
        return this.payments.filter(p =>
            p.id.toString().includes(this.searchTerm) ||
            p.orderId.toString().includes(this.searchTerm) ||
            p.transactionId?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            p.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
}