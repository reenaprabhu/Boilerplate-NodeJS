import { Request } from 'express';


declare module 'express' {
export interface Request {
currentUser?: { id: string; roles?: string[] };
}
}