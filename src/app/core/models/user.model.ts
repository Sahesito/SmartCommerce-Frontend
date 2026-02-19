export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'CLIENT';
    active: boolean;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserRequest {
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'CLIENT';
    active: boolean;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SELLER' | 'CLIENT';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'SELLER' | 'CLIENT';
}