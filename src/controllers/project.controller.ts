import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { PaginationOptions } from "../types/pagination";

export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  getAll = async (req: Request, res: Response) => {
    // Support pagination via query parameters
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const options: PaginationOptions | undefined = 
      page && limit ? { page, limit } : undefined;

    const projects = await this.service.getAll(options);
    res.json(projects);
  };

  getById = async (req: Request, res: Response) => {
    const project = await this.service.getById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  };

  getByOwner = async (req: Request, res: Response) => {
    // Support pagination for owner queries
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const options: PaginationOptions | undefined = 
      page && limit ? { page, limit } : undefined;

    const projects = await this.service.getByOwner(req.params.ownerId, options);
    res.json(projects);
  };

  create = async (req: Request, res: Response) => {
    const project = await this.service.create(req.body);
    res.status(201).json(project);
  };

  update = async (req: Request, res: Response) => {
    const updated = await this.service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  };

  delete = async (req: Request, res: Response) => {
    const ok = await this.service.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  };
}
