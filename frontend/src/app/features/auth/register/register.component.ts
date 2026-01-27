import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/services/role.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="card" style="max-width: 500px; margin: 50px auto;">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Name</label>
          <input type="text" formControlName="name" required>
          <div class="error" *ngIf="registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched">
            Name is required
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" required>
          <div class="error" *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched">
            Email is required
          </div>
          <div class="error" *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched">
            Invalid email format
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" required>
          <div class="error" *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched">
            Password is required
          </div>
          <div class="error" *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched">
            Password must be at least 6 characters
          </div>
        </div>
        <div class="form-group">
          <label>Roles (Optional)</label>
          <div *ngIf="loadingRoles">Loading roles...</div>
          <div *ngFor="let role of availableRoles" style="margin: 5px 0;">
            <label>
              <input type="checkbox" [value]="role.name" 
                     (change)="onRoleChange($event, role.name)">
              {{ role.name }} - {{ role.description || 'No description' }}
            </label>
          </div>
          <div *ngIf="availableRoles.length === 0 && !loadingRoles" class="info">
            No roles available. Default 'user' role will be assigned.
          </div>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="success" *ngIf="success">{{ success }}</div>
        <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        <p style="margin-top: 15px;">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </form>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  loadingRoles = false;
  error = '';
  success = '';
  availableRoles: Role[] = [];
  selectedRoles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
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
        // Continue without roles - default 'user' role will be assigned
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

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const registerData = {
        ...this.registerForm.value,
        roles: this.selectedRoles.length > 0 ? this.selectedRoles : undefined
      };

      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.success = response.message || 'Registration successful!';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err: any) => {
          this.loading = false;
          // Handle duplicate email error specifically
          let errorMessage = 'Registration failed. Please try again.';
          
          if (err.status === 409 || err.status === 400) {
            // Conflict or validation error
            errorMessage = err.error?.error || err.error?.message || 'Validation error';
            if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already exists')) {
              errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
            }
          } else if (err.error?.error) {
            errorMessage = err.error.error;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          this.error = errorMessage;
        }
      });
    }
  }
}
