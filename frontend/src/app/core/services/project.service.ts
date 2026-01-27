import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
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
export class ProjectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 20): Observable<PaginatedResponse<Project>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Project>>(`${this.apiUrl}/project`, { params });
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/project/${id}`);
  }

  create(data: CreateProjectDTO): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/project`, data);
  }

  update(id: string, data: UpdateProjectDTO): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/project/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/project/${id}`);
  }
}
