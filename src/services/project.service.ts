import { ProjectRepository } from "../repositories/project.repository";
import { CreateProjectDTO, UpdateProjectDTO } from "../models/project.model";

export class ProjectService {
  constructor(private readonly repo: ProjectRepository) {}

  getAll() {
    return this.repo.findAll();
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  getByOwner(userId: string) {
    return this.repo.findByOwner(userId);
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
