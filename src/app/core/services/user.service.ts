import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    getByEmail(email: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/email/${email}`);
    }

    getByRole(role: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
    }

    create(request: UserRequest): Observable<User> {
        return this.http.post<User>(this.apiUrl, request);
    }

    update(id: number, request: UserRequest): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    deletePermanently(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
    }

    reactivate(id: number): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}/reactivate`, {});
    }
}