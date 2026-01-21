import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, UpdateUserDTO } from "../models/user.model";
import { PaginationOptions, PaginatedResult } from "../types/pagination";
import { User } from "../models/user.model";

// Support both in-memory (for development) and DB repositories
type Repository = UserRepository | any;


export class UserService {
  constructor(private readonly repo: Repository) {}

  getAll(options?: PaginationOptions): Promise<PaginatedResult<User> | User[]> {
    // If pagination is requested, pass it to findAll (DB repos use it, in-memory ignore it)
    if (options) {
      return (this.repo as any).findAll(options);
    }
    // Otherwise use non-paginated findAll (backward compatible)
    return (this.repo as UserRepository).findAll();
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  getByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  create(dto: CreateUserDTO) {
    return this.repo.create(dto);
  }

  update(id: string, dto: UpdateUserDTO) {
    return this.repo.update(id, dto);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
