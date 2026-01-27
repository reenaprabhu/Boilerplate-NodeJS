import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="card" style="max-width: 400px; margin: 50px auto;">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" required>
          <div class="error" *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
            Email is required
          </div>
             <div class="error" *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
            Invalid email format
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" required>
          <div class="error" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
            Password is required
          </div>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="success" *ngIf="success">{{ success }}</div>
        <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p style="margin-top: 15px;">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </form>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Login successful!';
          // Redirect based on user role from response
          const user = response?.user || this.authService.getCurrentUser();
          let redirectPath = '/projects'; // Default for regular users
          
          if (user?.roles?.includes('admin')) {
            redirectPath = '/users';
          } else {
            // For manager and regular users, go to projects
            redirectPath = '/projects';
          }
          
          setTimeout(() => {
            this.router.navigate([redirectPath]);
          }, 1000);
        },
        error: (err) => {
          this.loading = false;
          // Handle different error response formats
          let errorMessage = 'Invalid credentials. Please check your email and password.';
          
          // Angular HttpClient wraps errors, so check err.error first
          if (err?.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error?.error) {
              errorMessage = err.error.error;
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          console.error('Login error:', err); // Debug log
          this.error = errorMessage;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
