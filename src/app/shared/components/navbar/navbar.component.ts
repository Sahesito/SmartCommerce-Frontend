import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/user.model';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MenubarModule,
        ButtonModule,
        AvatarModule,
        MenuModule
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

    currentUser: AuthResponse | null = null;
    userMenuItems: MenuItem[] = [];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.buildUserMenu();
        });
    }

    buildUserMenu(): void {
        this.userMenuItems = [
            {
                label: this.currentUser?.email || '',
                icon: 'pi pi-envelope',
                disabled: true
            },
            { separator: true },
            {
                label: 'Cerrar Sesión',
                icon: 'pi pi-sign-out',
                command: () => this.logout()
            }
        ];
    }

    logout(): void {
        this.authService.logout();
    }

    getRoleLabel(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'Administrador';
            case 'SELLER': return 'Vendedor';
            case 'CLIENT': return 'Cliente';
            default: return '';
        }
    }

    getRoleSeverity(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'admin';
            case 'SELLER': return 'seller';
            case 'CLIENT': return 'client';
            default: return '';
        }
    }

    getInitials(): string {
        if (!this.currentUser) return '?';
        return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }
}