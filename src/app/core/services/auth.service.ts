import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(
        this.getUserFromStorage()
    );

    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    private getUserFromStorage(): AuthResponse | null {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                localStorage.setItem('currentUser', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                this.currentUserSubject.next(response);
            })
        );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(response => {
                localStorage.setItem('currentUser', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                this.currentUserSubject.next(response);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    get currentUser(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('token');
    }

    get isLoggedIn(): boolean {
        return !!this.token;
    }

    get userRole(): string | null {
        return this.currentUser?.role ?? null;
    }

    isAdmin(): boolean {
        return this.userRole === 'ADMIN';
    }

    isSeller(): boolean {
        return this.userRole === 'SELLER';
    }

    isClient(): boolean {
        return this.userRole === 'CLIENT';
    }

    isAdminOrSeller(): boolean {
        return this.isAdmin() || this.isSeller();
    }
}