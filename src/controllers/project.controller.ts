import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  getAll = async (_req: Request, res: Response) => {
    const projects = await this.service.getAll();
    res.json(projects);
  };

  getById = async (req: Request, res: Response) => {
    const project = await this.service.getById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  };

  getByOwner = async (req: Request, res: Response) => {
    const projects = await this.service.getByOwner(req.params.ownerId);
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
