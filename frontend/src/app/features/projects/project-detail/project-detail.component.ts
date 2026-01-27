import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>Project Details</h2>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" *ngIf="project">
        <div class="form-group">
          <label>Name</label>
          <input type="text" formControlName="name" [readonly]="!authService.hasAnyRole('admin', 'manager')" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" formControlName="description" [readonly]="!authService.hasAnyRole('admin', 'manager')">
        </div>
        <div class="form-group">
          <label>Owner ID</label>
          <input type="text" [value]="project.ownerId" disabled>
        </div>
        <div class="success" *ngIf="success">{{ success }}</div>
        <button *ngIf="authService.hasAnyRole('admin', 'manager')" type="submit" class="btn btn-primary" [disabled]="projectForm.invalid || loading">
          {{ loading ? 'Updating...' : 'Update Project' }}
        </button>
        <button type="button" class="btn" (click)="goBack()">Back</button>
      </form>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  projectForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  projectId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.loadProject();
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.projectForm.patchValue({
          name: project.name,
          description: project.description || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load project';
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.projectService.update(this.projectId, this.projectForm.value).subscribe({
        next: () => {
          this.success = 'Project updated successfully!';
          this.loadProject();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || 'Failed to update project';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
