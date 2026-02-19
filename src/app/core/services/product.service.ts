import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    getActive(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/active`);
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    search(name: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/search?name=${name}`);
    }

    getByCategory(category: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
    }

    create(request: ProductRequest): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, request);
    }

    update(id: number, request: ProductRequest): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    reactivate(id: number): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}/reactivate`, {});
    }
}