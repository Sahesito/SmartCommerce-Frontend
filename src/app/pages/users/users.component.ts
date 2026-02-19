import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { UserService } from '../../core/services/user.service';
import { User, UserRequest } from '../../core/models/user.model';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        SelectModule,
        SkeletonModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

    users: User[] = [];
    loading = true;
    dialogVisible = false;
    isEditing = false;
    saving = false;
    searchTerm = '';

    selectedUser: User | null = null;

    userForm: UserRequest = this.emptyForm();

    roles = [
        { label: 'Administrador', value: 'ADMIN' },
        { label: 'Vendedor', value: 'SELLER' },
        { label: 'Cliente', value: 'CLIENT' }
    ];

    statusOptions = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    emptyForm(): UserRequest {
        return {
            firstName: '',
            lastName: '',
            email: '',
            role: 'CLIENT',
            active: true,
            phone: '',
            address: '',
            city: '',
            country: ''
        };
    }

    loadUsers(): void {
        this.loading = true;
        this.userService.getAll().subscribe({
            next: (users) => {
                this.users = users;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los usuarios'
                });
            }
        });
    }

    openCreate(): void {
        this.isEditing = false;
        this.userForm = this.emptyForm();
        this.dialogVisible = true;
    }

    openEdit(user: User): void {
        this.isEditing = true;
        this.selectedUser = user;
        this.userForm = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            active: user.active,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || ''
        };
        this.dialogVisible = true;
    }

    saveUser(): void {
        if (!this.userForm.firstName || !this.userForm.lastName || !this.userForm.email) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Nombre, apellido y correo son obligatorios'
            });
            return;
        }

        this.saving = true;

        if (this.isEditing && this.selectedUser) {
            this.userService.update(this.selectedUser.id, this.userForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Usuario actualizado correctamente'
                    });
                    this.loadUsers();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error al actualizar'
                    });
                }
            });
        } else {
            this.userService.create(this.userForm).subscribe({
                next: () => {
                    this.saving = false;
                    this.dialogVisible = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Usuario creado correctamente'
                    });
                    this.loadUsers();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error al crear'
                    });
                }
            });
        }
    }

    confirmDelete(user: User): void {
        this.confirmationService.confirm({
            message: `¿Desactivar a "${user.firstName} ${user.lastName}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.delete(user.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Desactivado',
                            detail: 'Usuario desactivado correctamente'
                        });
                        this.loadUsers();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo desactivar el usuario'
                        });
                    }
                });
            }
        });
    }

    reactivate(user: User): void {
        this.userService.reactivate(user.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Reactivado',
                    detail: 'Usuario reactivado correctamente'
                });
                this.loadUsers();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo reactivar el usuario'
                });
            }
        });
    }

    getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'SELLER': return 'warn';
            case 'CLIENT': return 'info';
            default: return 'secondary';
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'ADMIN': return 'Admin';
            case 'SELLER': return 'Vendedor';
            case 'CLIENT': return 'Cliente';
            default: return role;
        }
    }

    get filteredUsers(): User[] {
        if (!this.searchTerm) return this.users;
        return this.users.filter(u =>
            u.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
}