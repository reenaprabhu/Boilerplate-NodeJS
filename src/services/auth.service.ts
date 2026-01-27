import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { UserRepositoryDB } from "../repositories/user.repository.db";
import { signToken } from "../utils/jwt";

export class AuthService {
  constructor(private readonly userRepo: UserRepository | UserRepositoryDB) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    return {
      token: signToken({
        id: user.id,
        email: user.email,
        roles: user.roles,
      }),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }
}
