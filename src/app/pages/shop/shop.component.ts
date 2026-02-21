import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { OrderRequest } from '../../core/models/order.model';
import { CartService, CartItem } from '../../core/services/cart.service';
import { PaymentService } from '../../core/services/payment.service';


@Component({
    selector: 'app-shop',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TagModule,
        BadgeModule,
        DialogModule,
        ToastModule,
        SkeletonModule,
        InputNumberModule,
        DividerModule
    ],
    providers: [MessageService],
    templateUrl: './shop.component.html',
    styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {

    products: Product[] = [];
    filteredProducts: Product[] = [];
    cart: CartItem[] = [];
    loading = true;
    cartVisible = false;
    checkoutVisible = false;
    placingOrder = false;

    searchTerm = '';
    selectedCategory = '';

    categories = [
        { label: 'Todas las categorías', value: '' },
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Clothing', value: 'Clothing' },
        { label: 'Home & Kitchen', value: 'Home & Kitchen' },
        { label: 'Books', value: 'Books' },
        { label: 'Sports', value: 'Sports' }
    ];

    checkoutData = {
        shippingAddress: '',
        shippingCity: '',
        shippingCountry: 'Peru',
        paymentMethod: '',
        notes: ''
    };

    paymentMethods = [
        { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
        { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
        { label: 'Transferencia', value: 'TRANSFER' },
        { label: 'Efectivo', value: 'CASH' }
    ];

constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private messageService: MessageService,
    private cartService: CartService,
    private paymentService: PaymentService 
) {}


    ngOnInit(): void {
    this.loadProducts();
    this.cart = this.cartService.cart;
    this.cartService.cart$.subscribe(cart => {
        this.cart = cart;
    });
}

    loadProducts(): void {
        this.loading = true;
        this.productService.getActive().subscribe({
            next: (products) => {
                this.products = products;
                this.filteredProducts = products;
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

    filterProducts(): void {
        this.filteredProducts = this.products.filter(p => {
            const matchesSearch = !this.searchTerm ||
                p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = !this.selectedCategory ||
                p.category === this.selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }

    onSearchChange(): void {
        this.filterProducts();
    }

    onCategoryChange(): void {
        this.filterProducts();
    }

    addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.messageService.add({
        severity: 'success',
        summary: 'Agregado',
        detail: `${product.name} agregado al carrito`
    });
}

    removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
}

    updateQuantity(item: CartItem, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(item.product.id);
        } else {
            item.quantity = quantity;
        }
    }

    getCartTotal(): number {
        return this.cart.reduce((total, item) =>
            total + (item.product.price * item.quantity), 0);
    }

    getCartCount(): number {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    openCheckout(): void {
        if (this.cart.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Carrito vacío',
                detail: 'Agrega productos antes de continuar'
            });
            return;
        }
        this.cartVisible = false;
        this.checkoutVisible = true;
    }

    placeOrder(): void {
    if (!this.checkoutData.shippingAddress ||
        !this.checkoutData.shippingCity ||
        !this.checkoutData.paymentMethod) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Completa todos los campos de envío'
        });
        return;
    }

    this.placingOrder = true;
    const userId = this.authService.currentUser!.id;
    const total = this.getCartTotal();

    const orderRequest: OrderRequest = {
        userId,
        shippingAddress: this.checkoutData.shippingAddress,
        shippingCity: this.checkoutData.shippingCity,
        shippingCountry: this.checkoutData.shippingCountry,
        paymentMethod: this.checkoutData.paymentMethod,
        notes: this.checkoutData.notes,
        items: this.cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }))
    };

    // Paso 1: Crear orden
    this.orderService.create(orderRequest).subscribe({
        next: (order) => {
            // Paso 2: Registrar pago automáticamente
            this.paymentService.create({
                orderId: order.id,
                userId,
                amount: total,
                paymentMethod: this.checkoutData.paymentMethod,
                description: `Pago pedido #${order.id}`
            }).subscribe({
                next: () => {
                    this.placingOrder = false;
                    this.checkoutVisible = false;
                    this.cartService.clearCart();
                    this.resetCheckout();
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Pedido realizado!',
                        detail: `Pedido #${order.id} confirmado y pago registrado`
                    });
                },
                error: () => {
                    this.placingOrder = false;
                    this.checkoutVisible = false;
                    this.cartService.clearCart();
                    this.resetCheckout();
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Pedido creado',
                        detail: `Pedido #${order.id} creado. El pago no se pudo registrar automáticamente`
                    });
                }
            });
        },
        error: (err) => {
            this.placingOrder = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.error || 'No se pudo realizar el pedido'
            });
        }
    });
}

    resetCheckout(): void {
        this.checkoutData = {
            shippingAddress: '',
            shippingCity: '',
            shippingCountry: 'Peru',
            paymentMethod: '',
            notes: ''
        };
    }
}