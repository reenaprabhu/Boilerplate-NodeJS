import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService, Project, PaginatedResponse } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>Projects</h2>
      
      <!-- Create Project Form (Admin/Manager only) -->
      <div *ngIf="authService.hasAnyRole('admin', 'manager')" class="card" style="margin-bottom: 20px;">
        <h3>Create New Project</h3>
        <form [formGroup]="projectForm" (ngSubmit)="onCreateProject()">
          <div class="form-group">
            <label>Project Name</label>
            <input type="text" formControlName="name" placeholder="Project name">
            <div class="error" *ngIf="projectForm.get('name')?.hasError('required') && projectForm.get('name')?.touched">
              Project name is required
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea formControlName="description" rows="3" placeholder="Project description"></textarea>
          </div>
          <div class="error" *ngIf="createError">{{ createError }}</div>
          <div class="success" *ngIf="createSuccess">{{ createSuccess }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="projectForm.invalid || creating">
            {{ creating ? 'Creating...' : 'Create Project' }}
          </button>
        </form>
      </div>

      <!-- Projects List -->
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <table *ngIf="projects.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let project of projects">
            <td><strong>{{ project.name }}</strong></td>
            <td>{{ project.description || 'No description' }}</td>
            <td>{{ project.createdAt | date:'short' }}</td>
            <td>
              <button class="btn btn-primary" [routerLink]="['/projects', project.id]">View</button>
              <button *ngIf="authService.hasAnyRole('admin', 'manager')" class="btn btn-danger" (click)="deleteProject(project.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="projects.length === 0 && !loading" class="info">No projects found</div>
      
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
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  error = '';
  creating = false;
  createError = '';
  createSuccess = '';
  pagination: any = null;
  currentPage = 1;
  pageSize = 2;

  projectForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';
    
    this.projectService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse<Project>) => {
        this.projects = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load projects';
      }
    });
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.loadProjects();
  }

  onCreateProject(): void {
    if (this.projectForm.valid) {
      this.creating = true;
      this.createError = '';
      this.createSuccess = '';

      this.projectService.create(this.projectForm.value).subscribe({
        next: (project: Project) => {
          this.createSuccess = 'Project created successfully!';
          this.projectForm.reset();
          this.loadProjects();
          this.creating = false;
        },
        error: (err: any) => {
          this.creating = false;
          this.createError = err.error?.error || 'Failed to create project';
        }
      });
    }
  }

  deleteProject(id: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.delete(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (err: any) => {
          this.error = err.error?.error || 'Failed to delete project';
        }
      });
    }
  }
}
