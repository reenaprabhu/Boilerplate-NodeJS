import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User, PaginatedResponse, CreateUserDTO } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService, Role } from '../../../core/services/role.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>Users</h2>
      
      <!-- Create User Form (Admin only) -->
      <div *ngIf="authService.hasRole('admin')" class="card" style="margin-bottom: 20px;">
        <h3>Create New User</h3>
        <form [formGroup]="userForm" (ngSubmit)="onCreateUser()">
          <div class="form-group">
            <label>Name</label>
            <input type="text" formControlName="name" placeholder="User name">
            <div class="error" *ngIf="userForm.get('name')?.hasError('required') && userForm.get('name')?.touched">
              Name is required
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="user@example.com">
            <div class="error" *ngIf="userForm.get('email')?.hasError('required') && userForm.get('email')?.touched">
              Email is required
            </div>
            <div class="error" *ngIf="userForm.get('email')?.hasError('email') && userForm.get('email')?.touched">
              Invalid email format
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="Password">
            <div class="error" *ngIf="userForm.get('password')?.hasError('required') && userForm.get('password')?.touched">
              Password is required
            </div>
            <div class="error" *ngIf="userForm.get('password')?.hasError('minlength') && userForm.get('password')?.touched">
              Password must be at least 6 characters
            </div>
          </div>
          <div class="form-group">
            <label>Roles (Optional)</label>
            <div *ngIf="loadingRoles">Loading roles...</div>
            <div *ngFor="let role of availableRoles" style="margin: 5px 0;">
              <label>
                <input type="checkbox" [checked]="selectedRoles.includes(role.name)" 
                       (change)="onRoleChange($event, role.name)">
                {{ role.name }} - {{ role.description || 'No description' }}
              </label>
            </div>
            <div *ngIf="availableRoles.length === 0 && !loadingRoles" class="info">
              No roles available. Default 'user' role will be assigned.
            </div>
          </div>
          <div class="error" *ngIf="createError">{{ createError }}</div>
          <div class="success" *ngIf="createSuccess">{{ createSuccess }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || creating">
            {{ creating ? 'Creating...' : 'Create User' }}
          </button>
        </form>
      </div>

      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <table *ngIf="users.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span *ngFor="let role of user.roles" class="badge badge-primary">{{ role }}</span>
            </td>
            <td>
              <button class="btn btn-primary" [routerLink]="['/users', user.id]">View</button>
              <button *ngIf="authService.hasRole('admin')" class="btn btn-danger" (click)="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="users.length === 0 && !loading" class="success">No users found</div>
      
      <div class="pagination" *ngIf="pagination">
        <button class="btn" [disabled]="!pagination.hasPrev" (click)="loadPage(pagination.page - 1)">
          Previous
        </button>
        <span>Page {{ pagination.page }} of {{ pagination.totalPages }} (Total: {{ pagination.total }})</span>
        <button class="btn" [disabled]="!pagination.hasNext" (click)="loadPage(pagination.page + 1)">
          Next
        </button>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  creating = false;
  createError = '';
  createSuccess = '';
  loadingRoles = false;
  availableRoles: Role[] = [];
  selectedRoles: string[] = [];
  pagination: any = null;
  currentPage = 1;
  pageSize = 20;

  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private router: Router,
    public authService: AuthService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    if (this.authService.hasRole('admin')) {
      this.loadRoles();
    }
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getAll().subscribe({
      next: (roles: Role[]) => {
        this.availableRoles = roles;
        this.loadingRoles = false;
      },
      error: (err: any) => {
        console.error('Failed to load roles:', err);
        this.loadingRoles = false;
      }
    });
  }

  onRoleChange(event: Event, roleName: string): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.selectedRoles.includes(roleName)) {
        this.selectedRoles.push(roleName);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== roleName);
    }
  }

  onCreateUser(): void {
    if (this.userForm.valid) {
      this.creating = true;
      this.createError = '';
      this.createSuccess = '';

      const createData: CreateUserDTO = {
        ...this.userForm.value,
        roles: this.selectedRoles.length > 0 ? this.selectedRoles : undefined
      };

      this.userService.create(createData).subscribe({
        next: (user: User) => {
          this.createSuccess = 'User created successfully!';
          this.userForm.reset();
          this.selectedRoles = [];
          this.loadUsers();
          this.creating = false;
        },
        error: (err: any) => {
          this.creating = false;
          // Handle duplicate email error specifically
          let errorMessage = 'Failed to create user';
          
          if (err.status === 400 || err.status === 409) {
            // Validation or duplicate error
            errorMessage = err.error?.error || err.error?.message || 'Validation error';
            if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('unique')) {
              errorMessage = 'This email address is already registered. Please use a different email.';
            }
          } else if (err.error?.error) {
            errorMessage = err.error.error;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          this.createError = errorMessage;
        }
      });
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.userService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse<User>) => {
        this.users = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load users';
      }
    });
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err: any) => {
          this.error = err.error?.error || 'Failed to delete user';
        }
      });
    }
  }
}
