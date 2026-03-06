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
        { label: 'Credit Card', value: 'CREDIT_CARD' },
        { label: 'Debit Card', value: 'DEBIT_CARD' },
        { label: 'Transfer', value: 'TRANSFER' },
        { label: 'Cash', value: 'CASH' }
    ];

    statusOptions = [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Refunded', value: 'REFUNDED' }
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

        if (this.authService.isClient()) {
            const userId = this.authService.currentUser!.id;
            this.paymentService.getByUserId(userId).subscribe({
                next: (payments) => {
                    this.payments = payments;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('Payments could not be processed');
                }
            });
        } else {
            this.paymentService.getAll().subscribe({
                next: (payments) => {
                    this.payments = payments;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.showError('Payments could not be processed');
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
                summary: 'Required fields',
                detail: 'Order ID, amount, and payment method are required.'
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
                    summary: 'Registered payment',
                    detail: `Transaction ${payment.transactionId} processed`
                });
                this.loadPayments();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Payment processing error'
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
                    summary: 'Updated',
                    detail: 'Updated payment status'
                });
                this.loadPayments();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Error updating status'
                });
            }
        });
    }

    confirmDelete(payment: Payment): void {
        this.confirmationService.confirm({
            message: `¿Delete payment #${payment.id}?`,
            header: 'Confirm delete',
            icon: 'pi pi-trash',
            accept: () => {
                this.paymentService.delete(payment.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Delete',
                            detail: 'Payment deleted successfully'
                        });
                        this.loadPayments();
                    },
                    error: () => {
                        this.showError('The payment could not be cancelled');
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
            case 'PENDING': return 'Pending';
            case 'COMPLETED': return 'Completed';
            case 'FAILED': return 'Failed';
            case 'REFUNDED': return 'Refunded';
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