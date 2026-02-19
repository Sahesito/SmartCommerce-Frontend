export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductRequest {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    active: boolean;
}