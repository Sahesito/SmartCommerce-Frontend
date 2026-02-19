import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentRequest, PaymentStatusUpdateRequest } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    getById(id: number): Observable<Payment> {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }

    getByOrderId(orderId: number): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`);
    }

    getByUserId(userId: number): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`);
    }

    getByStatus(status: string): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/status/${status}`);
    }

    create(request: PaymentRequest): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, request);
    }

    updateStatus(id: number, request: PaymentStatusUpdateRequest): Observable<Payment> {
        return this.http.patch<Payment>(`${this.apiUrl}/${id}/status`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}