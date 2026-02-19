export interface Inventory {
    id: number;
    productId: number;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    location: string;
    lowStock: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface InventoryRequest {
    productId: number;
    quantity: number;
    reservedQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    location: string;
}

export interface StockUpdateRequest {
    quantity: number;
    reason: string;
}