
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
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { InventoryService } from '../../core/services/inventory.service';
import { AuthService } from '../../core/services/auth.service';
import { Inventory, InventoryRequest, StockUpdateRequest } from '../../core/models/inventory.model';

@Component({
    selector: 'app-inventory',
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
        InputNumberModule,
        SkeletonModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {

    inventory: Inventory[] = [];
    loading = true;
    dialogVisible = false;
    stockDialogVisible = false;
    isEditing = false;
    saving = false;
    searchTerm = '';
    stockAction: 'add' | 'reduce' = 'add';

    selectedInventory: Inventory | null = null;

    inventoryForm: InventoryRequest = this.emptyForm();

    stockRequest: StockUpdateRequest = {
        quantity: 1,
        reason: ''
    };

    constructor(
        private inventoryService: InventoryService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadInventory();
    }

    emptyForm(): InventoryRequest {
        return {
            productId: 0,
            quantity: 0,
            reservedQuantity: 0,
            minStockLevel: 10,
            maxStockLevel: 1000,
            location: ''
        };
    }

    loadInventory(): void {
        this.loading = true;
        this.inventoryService.getAll().subscribe({
            next: (data) => {
                this.inventory = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'The inventory could not be loaded.'
                });
            }
        });
    }

    openCreate(): void {
        this.isEditing = false;
        this.inventoryForm = this.emptyForm();
        this.dialogVisible = true;
    }

    openEdit(item: Inventory): void {
        this.isEditing = true;
        this.selectedInventory = item;
        this.inventoryForm = {
            productId: item.productId,
            quantity: item.quantity,
            reservedQuantity: item.reservedQuantity,
            minStockLevel: item.minStockLevel,
            maxStockLevel: item.maxStockLevel,
            location: item.location
        };
        this.dialogVisible = true;
    }

    openStockDialog(item: Inventory, action: 'add' | 'reduce'): void {
        this.selectedInventory = item;
        this.stockAction = action;
        this.stockRequest = { quantity: 1, reason: '' };
        this.stockDialogVisible = true;
    }

    saveInventory(): void {
        if (!this.inventoryForm.productId || this.inventoryForm.quantity < 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Required fields',
                detail: 'Product ID and quantity are required'
            });
            return;
        }

        this.saving = true;

        if (this.isEditing && this.selectedInventory) {
            this.inventoryService.update(this.selectedInventory.id, this.inventoryForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Updated',
                        detail: 'Inventory updated correctly'
                    });
                    this.loadInventory();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error updating'
                    });
                }
            });
        } else {
            this.inventoryService.create(this.inventoryForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Created',
                        detail: 'Inventory created successfully'
                    });
                    this.loadInventory();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error creating'
                    });
                }
            });
        }
    }

    updateStock(): void {
        if (!this.selectedInventory || this.stockRequest.quantity <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid amount',
                detail: 'The amount must be greater than 0'
            });
            return;
        }

        this.saving = true;
        const action$ = this.stockAction === 'add'
            ? this.inventoryService.addStock(this.selectedInventory.id, this.stockRequest)
            : this.inventoryService.reduceStock(this.selectedInventory.id, this.stockRequest);

        action$.subscribe({
            next: () => {
                this.saving = false;
                this.stockDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Updated stock',
                    detail: `Stock ${this.stockAction === 'add' ? 'add' : 'reduce'} correctly`
                });
                this.loadInventory();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Error updating stock'
                });
            }
        });
    }

    confirmDelete(item: Inventory): void {
        this.confirmationService.confirm({
            message: `Remove product inventory #${item.productId}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.delete(item.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Inventory successfully deleted'
                        });
                        this.loadInventory();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The inventory could not be deleted'
                        });
                    }
                });
            }
        });
    }

    getStockSeverity(item: Inventory): 'success' | 'warn' | 'danger' | 'secondary' {
        if (item.availableQuantity <= 0) return 'danger';
        if (item.lowStock) return 'warn';
        return 'success';
    }

    getStockLabel(item: Inventory): string {
        if (item.availableQuantity <= 0) return 'Out of stock';
        if (item.lowStock) return 'Low stock';
        return 'Normal';
    }

    get filteredInventory(): Inventory[] {
        if (!this.searchTerm) return this.inventory;
        return this.inventory.filter(i =>
            i.productId.toString().includes(this.searchTerm) ||
            i.location?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }
}