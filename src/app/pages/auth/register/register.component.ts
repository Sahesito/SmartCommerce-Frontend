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
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
    selector: 'app-register',
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
        DividerModule,
        SelectModule
    ],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {

    registerData: RegisterRequest = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CLIENT',
        phone: '',
        address: '',
        city: '',
        country: ''
    };

    confirmPassword = '';
    loading = false;

    roles = [
        { label: 'Cliente', value: 'CLIENT' },
        { label: 'Vendedor', value: 'SELLER' },
        { label: 'Administrador', value: 'ADMIN' }
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) { }

    onRegister(): void {
        if (!this.registerData.firstName || !this.registerData.lastName ||
            !this.registerData.email || !this.registerData.password) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Por favor completa todos los campos'
            });
            return;
        }

        if (this.registerData.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseñas no coinciden',
                detail: 'Verifica que las contraseñas sean iguales'
            });
            return;
        }

        if (this.registerData.password.length < 6) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña muy corta',
                detail: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        this.loading = true;

        this.authService.register(this.registerData).subscribe({
            next: (response) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Cuenta creada',
                    detail: `Bienvenido ${response.firstName}!`
                });

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
                    detail: err.error?.error || 'Error al crear la cuenta'
                });
            }
        });
    }
}