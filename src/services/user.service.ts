import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, UpdateUserDTO } from "../models/user.model";

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  getAll() {
    return this.repo.findAll();
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
