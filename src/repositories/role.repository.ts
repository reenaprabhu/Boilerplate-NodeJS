import { Role, CreateRoleDTO, UpdateRoleDTO } from '../models/role.model';
import { randomUUID } from 'crypto';

export class RoleRepository {
  private roles: Role[] = [];

  async findAll(): Promise<Role[]> {
    return this.roles;
  }

  async findById(id: string): Promise<Role | undefined> {
    return this.roles.find((r) => r.id === id);
  }

  async findByName(name: string): Promise<Role | undefined> {
    return this.roles.find((r) => r.name === name);
  }

  async create(dto: CreateRoleDTO): Promise<Role> {
    const newRole: Role = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.push(newRole);
    return newRole;
  }

  async update(id: string, dto: UpdateRoleDTO): Promise<Role | undefined> {
    const role = await this.findById(id);
    if (!role) return undefined;

    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    role.updatedAt = new Date();

    return role;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.roles.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    this.roles.splice(idx, 1);
    return true;
  }
}
