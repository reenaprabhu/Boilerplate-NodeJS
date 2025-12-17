import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private readonly service: UserService) {}

  getAll = async (_req: Request, res: Response) => {
    const users = await this.service.getAll();
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
