import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderRequest, OrderStatusUpdateRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {

    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    getById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    getByUserId(userId: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
    }

    getByStatus(status: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
    }

    create(request: OrderRequest): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, request);
    }

    updateStatus(id: number, request: OrderStatusUpdateRequest): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, request);
    }

    cancel(id: number): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, {});
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}