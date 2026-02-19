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
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductRequest } from '../../core/models/product.model';

@Component({
    selector: 'app-products',
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
        InputNumberModule,
        SkeletonModule,
        TextareaModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

    products: Product[] = [];
    loading = true;
    dialogVisible = false;
    isEditing = false;
    saving = false;
    searchTerm = '';

    selectedProduct: Product | null = null;

    productForm: ProductRequest = this.emptyForm();

    categories = [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Clothing', value: 'Clothing' },
        { label: 'Home & Kitchen', value: 'Home & Kitchen' },
        { label: 'Books', value: 'Books' },
        { label: 'Sports', value: 'Sports' }
    ];

    statusOptions = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];

    constructor(
        private productService: ProductService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    emptyForm(): ProductRequest {
        return {
            name: '',
            description: '',
            price: 0,
            category: '',
            imageUrl: '',
            active: true
        };
    }

    loadProducts(): void {
        this.loading = true;
        this.productService.getAll().subscribe({
            next: (products) => {
                this.products = products;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los productos'
                });
            }
        });
    }

    openCreate(): void {
        this.isEditing = false;
        this.productForm = this.emptyForm();
        this.dialogVisible = true;
    }

    openEdit(product: Product): void {
        this.isEditing = true;
        this.selectedProduct = product;
        this.productForm = {
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl || '',
            active: product.active
        };
        this.dialogVisible = true;
    }

    saveProduct(): void {
        if (!this.productForm.name || !this.productForm.category || !this.productForm.price) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Nombre, categoría y precio son obligatorios'
            });
            return;
        }

        this.saving = true;

        if (this.isEditing && this.selectedProduct) {
            this.productService.update(this.selectedProduct.id, this.productForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Producto actualizado correctamente'
                    });
                    this.loadProducts();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error al actualizar'
                    });
                }
            });
        } else {
            this.productService.create(this.productForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Producto creado correctamente'
                    });
                    this.loadProducts();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error al crear'
                    });
                }
            });
        }
    }

    confirmDelete(product: Product): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de desactivar "${product.name}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productService.delete(product.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Desactivado',
                            detail: 'Producto desactivado correctamente'
                        });
                        this.loadProducts();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo desactivar el producto'
                        });
                    }
                });
            }
        });
    }

    reactivate(product: Product): void {
        this.productService.reactivate(product.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Reactivado',
                    detail: 'Producto reactivado correctamente'
                });
                this.loadProducts();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo reactivar el producto'
                });
            }
        });
    }

    get filteredProducts(): Product[] {
        if (!this.searchTerm) return this.products;
        return this.products.filter(p =>
            p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }
}