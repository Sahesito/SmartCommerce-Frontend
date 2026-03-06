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
        { label: 'Client', value: 'CLIENT' },
        { label: 'Seller', value: 'SELLER' }
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
                summary: 'Required fields',
                detail: 'Please complete all fields'
            });
            return;
        }

        if (this.registerData.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Passwords do not match',
                detail: 'Verify that the passwords are the same'
            });
            return;
        }

        if (this.registerData.password.length < 6) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Very short password',
                detail: 'The password must be at least 6 characters long'
            });
            return;
        }

        this.loading = true;

        this.authService.register(this.registerData).subscribe({
            next: (response) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Created account',
                    detail: `Welcome ${response.firstName}!`
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
                    detail: err.error?.error || 'Error creating account'
                });
            }
        });
    }
}