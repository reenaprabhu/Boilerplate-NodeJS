import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
} from "../models/project.model";
import { randomUUID } from "crypto";

export class ProjectRepository {
  private projects: Project[] = [];

  async findAll(): Promise<Project[]> {
    return this.projects;
  }

  async findById(id: string): Promise<Project | undefined> {
    return this.projects.find((p) => p.id === id);
  }

  async findByOwner(userId: string): Promise<Project[]> {
    return this.projects.filter((p) => p.ownerId === userId);
  }

  async create(dto: CreateProjectDTO): Promise<Project> {
    const newProject: Project = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
    };

    this.projects.push(newProject);
    return newProject;
  }

  async update(
    id: string,
    dto: UpdateProjectDTO
  ): Promise<Project | undefined> {
    const project = await this.findById(id);
    if (!project) return undefined;

    if (dto.name) project.name = dto.name;
    if (dto.description) project.description = dto.description;

    return project;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    this.projects.splice(idx, 1);
    return true;
  }
}
