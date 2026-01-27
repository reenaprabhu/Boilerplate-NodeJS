import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { managerOrAdminGuard } from './core/guards/manager-or-admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [managerOrAdminGuard]
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent),
    canActivate: [managerOrAdminGuard]
  },
  {
    path: 'roles',
    loadComponent: () => import('./features/roles/role-list/role-list.component').then(m => m.RoleListComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    canActivate: [authGuard]
  }
];
