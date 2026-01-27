import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/delete`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): { id: string; email: string; roles: string[] } | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!user && user.roles.includes(role);
  }

  hasAnyRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }
}
