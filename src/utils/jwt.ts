import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const EXPIRES_IN = "1h";

export interface JwtPayload {
  id: string;
  email: string;
  roles: string[];
}

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
