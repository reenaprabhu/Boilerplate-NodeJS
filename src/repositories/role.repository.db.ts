import { Role, CreateRoleDTO, UpdateRoleDTO } from '../models/role.model';
import { RoleModel } from '../models/sequelize';
import { randomUUID } from 'crypto';

export class RoleRepositoryDB {
  async findAll(): Promise<Role[]> {
    const dbRoles = await RoleModel.findAll({
      order: [['name', 'ASC']],
    });

    return dbRoles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findById(id: string): Promise<Role | undefined> {
    const dbRole = await RoleModel.findByPk(id);
    if (!dbRole) return undefined;

    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || undefined,
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };
  }

  async findByName(name: string): Promise<Role | undefined> {
    const dbRole = await RoleModel.findOne({
      where: { name },
    });
    if (!dbRole) return undefined;

    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || undefined,
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };
  }

  async create(dto: CreateRoleDTO): Promise<Role> {
    const id = randomUUID();

    const dbRole = await RoleModel.create({
      id,
      name: dto.name,
      description: dto.description,
    });

    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || undefined,
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };
  }

  async update(id: string, dto: UpdateRoleDTO): Promise<Role | undefined> {
    const existingRole = await this.findById(id);
    if (!existingRole) return undefined;

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description || null;

    const [affectedRows] = await RoleModel.update(updateData, {
      where: { id },
    });

    if (affectedRows === 0) return existingRole;

    const dbRole = await RoleModel.findByPk(id);
    if (!dbRole) return undefined;

    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || undefined,
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await RoleModel.destroy({
      where: { id },
    });

    return deletedRows > 0;
  }
}
