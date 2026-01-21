import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];
  if (!header) return next();

  const [, token] = header.split(" ");
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    if (payload) {
      req.currentUser = {
        id: payload.id,
        roles: payload.roles,
        email: payload.email
      };
    }
  } catch (_) {
    // invalid token ignored
  }

  next();
}
