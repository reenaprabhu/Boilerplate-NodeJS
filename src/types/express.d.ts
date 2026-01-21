/// <reference types="express" />
import type { AuthTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthTokenPayload;
    }
  }
}

export {};
