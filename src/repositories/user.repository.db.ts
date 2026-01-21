import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model';
import { cacheService } from '../config/cache';
import { PaginationOptions, PaginatedResult, calculatePagination } from '../types/pagination';
import { UserModel, RoleModel } from '../models/sequelize';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';

const CACHE_TTL = 3600; // 1 hour
const CACHE_KEY_PREFIX = 'user:';
const CACHE_LIST_KEY = 'users:list:';

export class UserRepositoryDB {
  /**
   * Extract roles array from UserModel with Role associations
   */
  private extractRolesFromUser(dbUser: any): string[] {
    const roles = dbUser.Roles;
    if (Array.isArray(roles) && roles.length > 0) {
      return roles.map((role: any) => role.name);
    }
    return ['user']; // Default role if no roles assigned
  }

  /**
   * Assign roles to a user by role names
   */
  private async assignRolesToUser(userId: string, roleNames: string[]): Promise<void> {
    if (!roleNames || roleNames.length === 0) {
      // Assign default 'user' role
      roleNames = ['user'];
    }

    // Find role IDs by names
    const roles = await RoleModel.findAll({
      where: {
        name: {
          [Op.in]: roleNames,
        },
      },
    });

    // Get the user instance
    const user = await UserModel.findByPk(userId);
    if (!user) return;

    // Set roles using Sequelize association
    await (user as any).setRoles(roles);
  }

  /**
   * Cache-aside pattern: Check cache first, then database, then cache the result
   */
  async findAll(options?: PaginationOptions): Promise<PaginatedResult<User> | User[]> {
    // If no pagination, return all (for backward compatibility)
    if (!options) {
      const cacheKey = `${CACHE_LIST_KEY}all`;
      const cached = await cacheService.get<User[]>(cacheKey);
      if (cached) return cached;

      const dbUsers = await UserModel.findAll({
        include: [{
          model: RoleModel,
          as: 'Roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }, // Exclude junction table attributes
        }],
        order: [['id', 'ASC']],
      });

      const users: User[] = dbUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        roles: this.extractRolesFromUser(u),
      }));

      await cacheService.set(cacheKey, users, CACHE_TTL);
      return users;
    }

    // Paginated query
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const cacheKey = `${CACHE_LIST_KEY}page:${page}:limit:${limit}`;

    // Try cache first
    const cached = await cacheService.get<PaginatedResult<User>>(cacheKey);
    if (cached) return cached;

    // Fetch from database with pagination
    const { rows: dbUsers, count: total } = await UserModel.findAndCountAll({
      include: [{
        model: RoleModel,
        as: 'Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }, // Exclude junction table attributes
      }],
      order: [['id', 'ASC']],
      limit,
      offset,
    });

    const users: User[] = dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      roles: this.extractRolesFromUser(u),
    }));

    const result: PaginatedResult<User> = {
      data: users,
      pagination: calculatePagination(page, limit, total),
    };

    // Cache the result
    await cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  async findById(id: string): Promise<User | undefined> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}`;

    // Cache-aside: Check cache first
    const cached = await cacheService.get<User>(cacheKey);
    if (cached) return cached;

    // Fetch from database with roles
    const dbUser = await UserModel.findByPk(id, {
      include: [{
        model: RoleModel,
        as: 'Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });

    if (!dbUser) return undefined;

    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      roles: this.extractRolesFromUser(dbUser),
    };

    // Cache the result
    await cacheService.set(cacheKey, user, CACHE_TTL);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const cacheKey = `${CACHE_KEY_PREFIX}email:${email}`;

    // Cache-aside: Check cache first
    const cached = await cacheService.get<User>(cacheKey);
    if (cached) return cached;

    // Fetch from database (email is indexed for fast lookup)
    const dbUser = await UserModel.findOne({
      where: { email },
      include: [{
        model: RoleModel,
        as: 'Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });

    if (!dbUser) return undefined;

    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      roles: this.extractRolesFromUser(dbUser),
    };

    // Cache with both ID and email keys for flexibility
    await cacheService.set(cacheKey, user, CACHE_TTL);
    await cacheService.set(`${CACHE_KEY_PREFIX}${user.id}`, user, CACHE_TTL);

    return user;
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const id = randomUUID();

    // Create user using Sequelize
    const dbUser = await UserModel.create({
      id,
      name: dto.name,
      email: dto.email,
      passwordHash: hashed,
    });

    // Assign roles: use provided roles or default to 'user'
    const rolesToAssign = dto.roles && dto.roles.length > 0 ? dto.roles : ['user'];
    await this.assignRolesToUser(id, rolesToAssign);

    // Fetch user with roles
    const userWithRoles = await UserModel.findByPk(id, {
      include: [{
        model: RoleModel,
        as: 'Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });

    if (!userWithRoles) {
      throw new Error('Failed to create user');
    }

    const user: User = {
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      passwordHash: userWithRoles.passwordHash,
      roles: this.extractRolesFromUser(userWithRoles),
    };

    // Invalidate cache on write
    await this.invalidateCache(user.id, user.email);

    return user;
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User | undefined> {
    const existingUser = await this.findById(id);
    if (!existingUser) return undefined;

    const updateData: any = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Update user using Sequelize
    if (Object.keys(updateData).length > 0) {
      const [affectedRows] = await UserModel.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) return existingUser;
    }

    // Handle role updates separately via associations
    if (dto.roles) {
      await this.assignRolesToUser(id, dto.roles);
    }

    // Fetch updated user with roles
    const dbUser = await UserModel.findByPk(id, {
      include: [{
        model: RoleModel,
        as: 'Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });

    if (!dbUser) return undefined;

    const updatedUser: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      roles: this.extractRolesFromUser(dbUser),
    };

    // Invalidate cache on write
    await this.invalidateCache(updatedUser.id, existingUser.email, updatedUser.email);

    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;

    // Delete from database using Sequelize
    const deletedRows = await UserModel.destroy({
      where: { id },
    });

    if (deletedRows === 0) return false;

    // Invalidate cache on write
    await this.invalidateCache(id, user.email);

    return true;
  }

  /**
   * Invalidate all cache entries for a user
   */
  private async invalidateCache(id: string, oldEmail?: string, newEmail?: string): Promise<void> {
    // Invalidate by ID
    await cacheService.delete(`${CACHE_KEY_PREFIX}${id}`);

    // Invalidate by old email if changed
    if (oldEmail) {
      await cacheService.delete(`${CACHE_KEY_PREFIX}email:${oldEmail}`);
    }

    // Invalidate by new email
    if (newEmail) {
      await cacheService.delete(`${CACHE_KEY_PREFIX}email:${newEmail}`);
    }

    // Invalidate all list caches (they may contain this user)
    await cacheService.deletePattern(`${CACHE_LIST_KEY}*`);
  }
}
