import { User, CreateUserDTO, UpdateUserDTO } from "../models/user.model";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export class UserRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    // Use provided roles or default to 'user'
    const roles = dto.roles && dto.roles.length > 0 ? dto.roles : ["user"];
    
    const newUser: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      passwordHash: hashed,
      roles: roles,
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User | undefined> {
    const user = await this.findById(id);
    if (!user) return undefined;

    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.roles) user.roles = dto.roles;

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
