import { Project, CreateProjectDTO, UpdateProjectDTO } from '../models/project.model';
import { cacheService } from '../config/cache';
import { PaginationOptions, PaginatedResult, calculatePagination } from '../types/pagination';
import { ProjectModel } from '../models/sequelize';
import { randomUUID } from 'crypto';

const CACHE_TTL = 3600; // 1 hour
const CACHE_KEY_PREFIX = 'project:';
const CACHE_LIST_KEY = 'projects:list:';
const CACHE_OWNER_KEY = 'projects:owner:';

export class ProjectRepositoryDB {
  /**
   * Cache-aside pattern with pagination support
   */
  async findAll(options?: PaginationOptions): Promise<PaginatedResult<Project> | Project[]> {
    if (!options) {
      const cacheKey = `${CACHE_LIST_KEY}all`;
      const cached = await cacheService.get<Project[]>(cacheKey);
      if (cached) return cached;

      const dbProjects = await ProjectModel.findAll({
        order: [['created_at', 'DESC']],
      });

      const projects: Project[] = dbProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        ownerId: p.ownerId,
      }));

      await cacheService.set(cacheKey, projects, CACHE_TTL);
      return projects;
    }

    // Paginated query
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const cacheKey = `${CACHE_LIST_KEY}page:${page}:limit:${limit}`;

    const cached = await cacheService.get<PaginatedResult<Project>>(cacheKey);
    if (cached) return cached;

    const { rows: dbProjects, count: total } = await ProjectModel.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const projects: Project[] = dbProjects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      ownerId: p.ownerId,
    }));

    const result: PaginatedResult<Project> = {
      data: projects,
      pagination: calculatePagination(page, limit, total),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findById(id: string): Promise<Project | undefined> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}`;

    const cached = await cacheService.get<Project>(cacheKey);
    if (cached) return cached;

    const dbProject = await ProjectModel.findByPk(id);

    if (!dbProject) return undefined;

    const project: Project = {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || undefined,
      ownerId: dbProject.ownerId,
    };

    await cacheService.set(cacheKey, project, CACHE_TTL);
    return project;
  }

  async findByOwner(userId: string, options?: PaginationOptions): Promise<PaginatedResult<Project> | Project[]> {
    if (!options) {
      const cacheKey = `${CACHE_OWNER_KEY}${userId}:all`;
      const cached = await cacheService.get<Project[]>(cacheKey);
      if (cached) return cached;

      // Uses index on owner_id for fast lookup
      const dbProjects = await ProjectModel.findAll({
        where: { ownerId: userId },
        order: [['created_at', 'DESC']],
      });

      const projects: Project[] = dbProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        ownerId: p.ownerId,
      }));

      await cacheService.set(cacheKey, projects, CACHE_TTL);
      return projects;
    }

    // Paginated query by owner
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const cacheKey = `${CACHE_OWNER_KEY}${userId}:page:${page}:limit:${limit}`;

    const cached = await cacheService.get<PaginatedResult<Project>>(cacheKey);
    if (cached) return cached;

    const { rows: dbProjects, count: total } = await ProjectModel.findAndCountAll({
      where: { ownerId: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const projects: Project[] = dbProjects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      ownerId: p.ownerId,
    }));

    const result: PaginatedResult<Project> = {
      data: projects,
      pagination: calculatePagination(page, limit, total),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async create(dto: CreateProjectDTO): Promise<Project> {
    const id = randomUUID();

    const dbProject = await ProjectModel.create({
      id,
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
    });

    const project: Project = {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || undefined,
      ownerId: dbProject.ownerId,
    };

    // Invalidate cache on write
    await this.invalidateCache(project.id, project.ownerId);

    return project;
  }

  async update(id: string, dto: UpdateProjectDTO): Promise<Project | undefined> {
    const existingProject = await this.findById(id);
    if (!existingProject) return undefined;

    const updateData: any = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description || null;

    // Update using Sequelize
    const [affectedRows] = await ProjectModel.update(updateData, {
      where: { id },
    });

    if (affectedRows === 0) return existingProject;

    const dbProject = await ProjectModel.findByPk(id);
    if (!dbProject) return undefined;

    const updatedProject: Project = {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || undefined,
      ownerId: dbProject.ownerId,
    };

    // Invalidate cache on write
    await this.invalidateCache(updatedProject.id, updatedProject.ownerId);

    return updatedProject;
  }

  async delete(id: string): Promise<boolean> {
    const project = await this.findById(id);
    if (!project) return false;

    const deletedRows = await ProjectModel.destroy({
      where: { id },
    });

    if (deletedRows === 0) return false;

    // Invalidate cache on write
    await this.invalidateCache(id, project.ownerId);

    return true;
  }

  /**
   * Invalidate all cache entries for a project
   */
  private async invalidateCache(id: string, ownerId: string): Promise<void> {
    // Invalidate by ID
    await cacheService.delete(`${CACHE_KEY_PREFIX}${id}`);

    // Invalidate all list caches
    await cacheService.deletePattern(`${CACHE_LIST_KEY}*`);

    // Invalidate owner-specific caches
    await cacheService.deletePattern(`${CACHE_OWNER_KEY}${ownerId}:*`);
  }
}
