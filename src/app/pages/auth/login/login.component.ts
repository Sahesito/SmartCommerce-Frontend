import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        ToastModule,
        DividerModule
    ],
    providers: [MessageService],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

    loginData: LoginRequest = {
        email: '',
        password: ''
    };

    loading = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) { }

    onLogin(): void {
        if (!this.loginData.email || !this.loginData.password) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Por favor completa todos los campos'
            });
            return;
        }

        this.loading = true;

        this.authService.login(this.loginData).subscribe({
            next: (response) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Bienvenido',
                    detail: `Hola ${response.firstName}!`
                });

                // Redirigir según el rol
                setTimeout(() => {
                    if (response.role === 'CLIENT') {
                        this.router.navigate(['/shop']);
                    } else {
                        this.router.navigate(['/dashboard']);
                    }
                }, 1000);
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Credenciales incorrectas'
                });
            }
        });
    }
}