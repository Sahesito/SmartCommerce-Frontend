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
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Seller', value: 'SELLER' },
        { label: 'Client', value: 'CLIENT' }
    ];

    statusOptions = [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
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
                    detail: 'Users could not be loaded'
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
                summary: 'Required fields',
                detail: 'Name, lastnames and email are required'
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
                        summary: 'Updated',
                        detail: 'Successfully updated user'
                    });
                    this.loadUsers();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error updating'
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
                        summary: 'Created',
                        detail: 'Successfully created user'
                    });
                    this.loadUsers();
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.error || 'Error creating'
                    });
                }
            });
        }
    }

    confirmDelete(user: User): void {
        this.confirmationService.confirm({
            message: `¿Deactivate to "${user.firstName} ${user.lastName}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.delete(user.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Disabled',
                            detail: 'User successfully deactivated'
                        });
                        this.loadUsers();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The user could not be deactivated'
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
                    summary: 'Reactivated',
                    detail: 'User reactivated successfully'
                });
                this.loadUsers();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'The user could not be reactivated'
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
            case 'SELLER': return 'Seller';
            case 'CLIENT': return 'Client';
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