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
    try {
      const user = await this.service.create(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      // Handle duplicate email error
      if (error.name === 'SequelizeUniqueConstraintError') {
        const message = error.errors?.[0]?.message || 
                       (error.message?.includes('email') ? 'Email already exists' : 'Duplicate entry');
        return res.status(409).json({ 
          error: message,
          message: message 
        });
      }
      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        const message = error.errors?.[0]?.message || 'Validation error';
        return res.status(400).json({ 
          error: message,
          message: message 
        });
      }
      // Handle other errors
      console.error('User creation error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create user',
        message: error.message || 'Failed to create user'
      });
    }
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
