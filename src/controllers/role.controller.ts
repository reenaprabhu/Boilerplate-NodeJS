import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  constructor(private readonly service: RoleService) {}

  getAll = async (req: Request, res: Response) => {
    const roles = await this.service.getAll();
    res.json(roles);
  };

  getById = async (req: Request, res: Response) => {
    const role = await this.service.getById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  };

  create = async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Role name is required' 
      });
    }

    try {
      // Check if role already exists
      const existingRole = await this.service.getByName(name);
      if (existingRole) {
        return res.status(409).json({ 
          success: false,
          error: 'Role with this name already exists' 
        });
      }

      const role = await this.service.create({ name, description });
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error: any) {
      console.error('Create role error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create role',
        message: error?.message || 'An unexpected error occurred'
      });
    }
  };

  update = async (req: Request, res: Response) => {
    const updated = await this.service.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        error: 'Role not found' 
      });
    }
    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updated
    });
  };

  delete = async (req: Request, res: Response) => {
    const ok = await this.service.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ 
        success: false,
        error: 'Role not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Role deleted successfully' 
    });
  };
}
