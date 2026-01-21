/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

/**
 * Middleware to require authentication
 * Returns 401 if no valid token is provided
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const [, token] = header.split(" ");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Invalid token format" });
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    req.currentUser = {
      id: payload.id,
      roles: payload.roles,
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid or expired token" });
  }
}
