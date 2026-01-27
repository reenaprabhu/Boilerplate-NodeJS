import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoleService, Role } from '../../../core/services/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>Roles</h2>
      
      <!-- Create Role Form -->
      <div class="card" style="margin-bottom: 20px;">
        <h3>Create New Role</h3>
        <form [formGroup]="roleForm" (ngSubmit)="onCreateRole()">
          <div class="form-group">
            <label>Role Name</label>
            <input type="text" formControlName="name" placeholder="e.g., editor">
            <div class="error" *ngIf="roleForm.get('name')?.hasError('required') && roleForm.get('name')?.touched">
              Role name is required
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea formControlName="description" rows="3" placeholder="Role description"></textarea>
          </div>
          <div class="error" *ngIf="createError">{{ createError }}</div>
          <div class="success" *ngIf="createSuccess">{{ createSuccess }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="roleForm.invalid || creating">
            {{ creating ? 'Creating...' : 'Create Role' }}
          </button>
        </form>
      </div>

      <!-- Roles List -->
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <table *ngIf="roles.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let role of roles">
            <td><strong>{{ role.name }}</strong></td>
            <td>{{ role.description || 'No description' }}</td>
            <td>
              <button class="btn btn-primary" (click)="editRole(role)">Edit</button>
              <button class="btn btn-danger" (click)="deleteRole(role.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="roles.length === 0 && !loading" class="info">No roles found</div>

      <!-- Edit Role Modal -->
      <div *ngIf="editingRole" class="modal" style="display: block;">
        <div class="modal-content">
          <h3>Edit Role</h3>
          <form [formGroup]="editForm" (ngSubmit)="onUpdateRole()">
            <div class="form-group">
              <label>Role Name</label>
              <input type="text" formControlName="name">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="3"></textarea>
            </div>
            <div class="error" *ngIf="updateError">{{ updateError }}</div>
            <div class="success" *ngIf="updateSuccess">{{ updateSuccess }}</div>
            <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || updating">
              {{ updating ? 'Updating...' : 'Update' }}
            </button>
            <button type="button" class="btn" (click)="cancelEdit()">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  error = '';
  creating = false;
  createError = '';
  createSuccess = '';
  updating = false;
  updateError = '';
  updateSuccess = '';
  editingRole: Role | null = null;

  roleForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';
    
    this.roleService.getAll().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load roles';
      }
    });
  }

  onCreateRole(): void {
    if (this.roleForm.valid) {
      this.creating = true;
      this.createError = '';
      this.createSuccess = '';

      this.roleService.create(this.roleForm.value).subscribe({
        next: (role: Role) => {
          this.createSuccess = 'Role created successfully!';
          this.roleForm.reset();
          this.loadRoles();
          this.creating = false;
        },
        error: (err: any) => {
          this.creating = false;
          this.createError = err.error?.error || 'Failed to create role';
        }
      });
    }
  }

  editRole(role: Role): void {
    this.editingRole = role;
    this.editForm.patchValue({
      name: role.name,
      description: role.description || ''
    });
  }

  cancelEdit(): void {
    this.editingRole = null;
    this.editForm.reset();
    this.updateError = '';
    this.updateSuccess = '';
  }

  onUpdateRole(): void {
    if (this.editForm.valid && this.editingRole) {
      this.updating = true;
      this.updateError = '';
      this.updateSuccess = '';

      this.roleService.update(this.editingRole.id, this.editForm.value).subscribe({
        next: () => {
          this.updateSuccess = 'Role updated successfully!';
          this.loadRoles();
          setTimeout(() => {
            this.cancelEdit();
          }, 1500);
          this.updating = false;
        },
        error: (err: any) => {
          this.updating = false;
          this.updateError = err.error?.error || 'Failed to update role';
        }
      });
    }
  }

  deleteRole(id: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.delete(id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (err: any) => {
          this.error = err.error?.error || 'Failed to delete role';
        }
      });
    }
  }
}
