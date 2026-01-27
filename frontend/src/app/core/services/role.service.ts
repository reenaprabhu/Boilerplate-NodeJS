import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/role`);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/role/${id}`);
  }

  getByName(name: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/role/name/${name}`);
  }

  create(data: CreateRoleDTO): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/role`, data);
  }

  update(id: string, data: UpdateRoleDTO): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/role/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/role/${id}`);
  }
}
