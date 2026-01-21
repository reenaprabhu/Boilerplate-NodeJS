/**
 * Dependency Injection Container
 * 
 * This file manages the creation and injection of dependencies.
 * Use USE_DATABASE environment variable to switch between in-memory and database repositories.
 */

import { UserRepository } from '../repositories/user.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserService } from '../services/user.service';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { UserController } from '../controllers/user.controller';
import { ProjectController } from '../controllers/project.controller';
import { RoleController } from '../controllers/role.controller';

// Determine which repository implementation to use
const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Repository instances
let userRepository: UserRepository;
let projectRepository: ProjectRepository;
let roleRepository: RoleRepository;

if (USE_DATABASE) {
  try {
    // Dynamically import database modules only when needed
    const { UserRepositoryDB } = require('../repositories/user.repository.db');
    const { ProjectRepositoryDB } = require('../repositories/project.repository.db');
    const { RoleRepositoryDB } = require('../repositories/role.repository.db');
    
    // Use database repositories with caching
    userRepository = new UserRepositoryDB();
    projectRepository = new ProjectRepositoryDB();
    roleRepository = new RoleRepositoryDB();
    console.log('Using SQL Server database repositories with Redis caching');
  } catch (error: any) {
    console.warn('Failed to load database repositories:', error.message);
    console.warn('Falling back to in-memory repositories. Check DATABASE_URL configuration.');
    // Fallback to in-memory repositories
    userRepository = new UserRepository();
    projectRepository = new ProjectRepository();
    roleRepository = new RoleRepository();
    console.log('Using in-memory repositories (no persistence)');
  }
} else {
  // Use in-memory repositories (for development/testing)
  userRepository = new UserRepository();
  projectRepository = new ProjectRepository();
  roleRepository = new RoleRepository();
  console.log('Using in-memory repositories (no persistence)');
}

// Service instances
export const userService = new UserService(userRepository);
export const projectService = new ProjectService(projectRepository);
export const roleService = new RoleService(roleRepository);
export const authService = new AuthService(userRepository as UserRepository);

// Controller instances
export const userController = new UserController(userService);
export const projectController = new ProjectController(projectService);
export const roleController = new RoleController(roleService);
