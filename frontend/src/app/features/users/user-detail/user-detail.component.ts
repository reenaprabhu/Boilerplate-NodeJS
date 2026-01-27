import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';
import { RoleService, Role } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>User Details</h2>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" *ngIf="user">
        <div class="form-group">
          <label>Name</label>
          <input type="text" formControlName="name">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email">
        </div>
        <div class="form-group">
          <label>Current Roles</label>
          <div>
            <span *ngFor="let role of user.roles" class="badge badge-primary">{{ role }}</span>
          </div>
        </div>
        <div class="form-group" *ngIf="authService.hasRole('admin')">
          <label>Assign Roles</label>
          <div *ngFor="let role of availableRoles" style="margin: 5px 0;">
            <label>
              <input type="checkbox" [checked]="selectedRoles.includes(role.name)" 
                     (change)="onRoleChange($event, role.name)">
              {{ role.name }} - {{ role.description }}
            </label>
          </div>
        </div>
        <div class="success" *ngIf="success">{{ success }}</div>
        <button *ngIf="authService.hasRole('admin')" type="submit" class="btn btn-primary" [disabled]="userForm.invalid || loading">
          {{ loading ? 'Updating...' : 'Update User' }}
        </button>
        <button type="button" class="btn" (click)="goBack()">Back</button>
      </form>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  userForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  availableRoles: Role[] = [];
  selectedRoles: string[] = [];
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    public authService: AuthService
  ) {
    this.userForm = this.fb.group({
      name: [''],
      email: ['', Validators.email]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.loadUser();
    this.loadRoles();
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getById(this.userId).subscribe({
      next: (user: User) => {
        this.user = user;
        this.selectedRoles = [...user.roles];
        this.userForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load user';
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (roles: Role[]) => {
        this.availableRoles = roles;
      },
      error: (err: any) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  onRoleChange(event: any, roleName: string): void {
    if (event.target.checked) {
      if (!this.selectedRoles.includes(roleName)) {
        this.selectedRoles.push(roleName);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== roleName);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      // Combine form data with selected roles
      const updateData: any = {
        ...this.userForm.value
      };

      // Always include roles if admin is updating (even if empty array to allow clearing roles)
      if (this.authService.hasRole('admin')) {
        updateData.roles = this.selectedRoles;
      }

      this.userService.update(this.userId, updateData).subscribe({
        next: () => {
          this.success = 'User updated successfully!';
          this.loadUser();
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.error || 'Failed to update user';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
