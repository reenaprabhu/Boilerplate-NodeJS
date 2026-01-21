import { Request, Response, NextFunction } from 'express';

export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const hasRole = roles.some(role => req.currentUser!.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
