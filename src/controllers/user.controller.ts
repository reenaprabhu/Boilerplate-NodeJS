import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { PaginationOptions } from "../types/pagination";

export class UserController {
  constructor(private readonly service: UserService) {}

  getAll = async (req: Request, res: Response) => {
    // Support pagination via query parameters
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const options: PaginationOptions | undefined = 
      page && limit ? { page, limit } : undefined;

    const users = await this.service.getAll(options);
    res.json(users);
  };

  getById = async (req: Request, res: Response) => {
    const user = await this.service.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  };

  create = async (req: Request, res: Response) => {
    const user = await this.service.create(req.body);
    res.status(201).json(user);
  };

  update = async (req: Request, res: Response) => {
    const updated = await this.service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  };

  delete = async (req: Request, res: Response) => {
    const ok = await this.service.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  };
}
