import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventory, InventoryRequest, StockUpdateRequest } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {

    private apiUrl = `${environment.apiUrl}/inventory`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Inventory[]> {
        return this.http.get<Inventory[]>(this.apiUrl);
    }

    getById(id: number): Observable<Inventory> {
        return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
    }

    getByProductId(productId: number): Observable<Inventory> {
        return this.http.get<Inventory>(`${this.apiUrl}/product/${productId}`);
    }

    getLowStock(): Observable<Inventory[]> {
        return this.http.get<Inventory[]>(`${this.apiUrl}/low-stock`);
    }

    checkAvailability(productId: number, quantity: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/check-availability?productId=${productId}&quantity=${quantity}`);
    }

    create(request: InventoryRequest): Observable<Inventory> {
        return this.http.post<Inventory>(this.apiUrl, request);
    }

    update(id: number, request: InventoryRequest): Observable<Inventory> {
        return this.http.put<Inventory>(`${this.apiUrl}/${id}`, request);
    }

    addStock(id: number, request: StockUpdateRequest): Observable<Inventory> {
        return this.http.patch<Inventory>(`${this.apiUrl}/${id}/add-stock`, request);
    }

    reduceStock(id: number, request: StockUpdateRequest): Observable<Inventory> {
        return this.http.patch<Inventory>(`${this.apiUrl}/${id}/reduce-stock`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}