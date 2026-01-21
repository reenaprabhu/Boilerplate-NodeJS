import { RoleRepository } from '../repositories/role.repository';
import { RoleRepositoryDB } from '../repositories/role.repository.db';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../models/role.model';

type Repository = RoleRepository | RoleRepositoryDB;

export class RoleService {
  constructor(private readonly repo: Repository) {}

  getAll(): Promise<Role[]> {
    return this.repo.findAll();
  }

  getById(id: string): Promise<Role | undefined> {
    return this.repo.findById(id);
  }

  getByName(name: string): Promise<Role | undefined> {
    return this.repo.findByName(name);
  }

  create(dto: CreateRoleDTO): Promise<Role> {
    return this.repo.create(dto);
  }

  update(id: string, dto: UpdateRoleDTO): Promise<Role | undefined> {
    return this.repo.update(id, dto);
  }

  delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
