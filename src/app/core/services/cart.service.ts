import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

    private cartSubject = new BehaviorSubject<CartItem[]>([]);
    cart$ = this.cartSubject.asObservable();

    get cart(): CartItem[] {
        return this.cartSubject.value;
    }

    addToCart(product: Product): void {
        const current = this.cartSubject.value;
        const existing = current.find(i => i.product.id === product.id);
        if (existing) {
            existing.quantity++;
            this.cartSubject.next([...current]);
        } else {
            this.cartSubject.next([...current, { product, quantity: 1 }]);
        }
    }

    removeFromCart(productId: number): void {
        this.cartSubject.next(
            this.cartSubject.value.filter(i => i.product.id !== productId)
        );
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        const current = this.cartSubject.value.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
        );
        this.cartSubject.next(current);
    }

    clearCart(): void {
        this.cartSubject.next([]);
    }

    getTotal(): number {
        return this.cartSubject.value.reduce(
            (total, item) => total + item.product.price * item.quantity, 0
        );
    }

    getCount(): number {
        return this.cartSubject.value.reduce(
            (count, item) => count + item.quantity, 0
        );
    }
}