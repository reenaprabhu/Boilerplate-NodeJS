import { ProjectRepository } from "../repositories/project.repository";
import { CreateProjectDTO, UpdateProjectDTO } from "../models/project.model";
import { PaginationOptions, PaginatedResult } from "../types/pagination";
import { Project } from "../models/project.model";

// Support both in-memory (for development) and DB repositories
type Repository = ProjectRepository | any;


export class ProjectService {
  constructor(private readonly repo: Repository) {}

  getAll(options?: PaginationOptions): Promise<PaginatedResult<Project> | Project[]> {
    // If pagination is requested, pass it to findAll (DB repos use it, in-memory ignore it)
    if (options) {
      return (this.repo as any).findAll(options);
    }
    // Otherwise use non-paginated findAll (backward compatible)
    return (this.repo as ProjectRepository).findAll();
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  getByOwner(userId: string, options?: PaginationOptions): Promise<PaginatedResult<Project> | Project[]> {
    // If pagination is requested, pass it to findByOwner (DB repos use it, in-memory ignore it)
    if (options) {
      return (this.repo as any).findByOwner(userId, options);
    }
    // Fallback for in-memory repository or non-paginated query
    return (this.repo as ProjectRepository).findByOwner(userId);
  }

  create(dto: CreateProjectDTO) {
    return this.repo.create(dto);
  }

  update(id: string, dto: UpdateProjectDTO) {
    return this.repo.update(id, dto);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
