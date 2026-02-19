export interface Payment {
    id: number;
    orderId: number;
    userId: number;
    amount: number;
    paymentMethod: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentRequest {
    orderId: number;
    userId: number;
    amount: number;
    paymentMethod: string;
    description?: string;
}

export interface PaymentStatusUpdateRequest {
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}