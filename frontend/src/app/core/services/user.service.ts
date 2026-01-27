import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 20): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/user`, { params });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/email/${email}`);
  }

  create(data: CreateUserDTO): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, data);
  }

  update(id: string, data: UpdateUserDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/user/${id}`);
  }

  assignRoles(userId: string, roleNames: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/${userId}/roles`, { roleNames });
  }

  getUserRoles(userId: string): Observable<{ userId: string; roles: string[] }> {
    return this.http.get<{ userId: string; roles: string[] }>(`${this.apiUrl}/user/${userId}/roles`);
  }
}
