import { Request, Response, NextFunction } from "express";

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.currentUser;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const has = user.roles?.some((r) => roles.includes(r));
    if (!has)
      return res.status(403).json({ error: "Forbidden: insufficient role" });

    next();
  };
}
