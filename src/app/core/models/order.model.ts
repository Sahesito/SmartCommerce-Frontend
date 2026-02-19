export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Order {
    id: number;
    userId: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    paymentMethod: string;
    notes?: string;
    items: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderRequest {
    userId: number;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    paymentMethod: string;
    notes?: string;
    items: OrderItemRequest[];
}

export interface OrderStatusUpdateRequest {
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}