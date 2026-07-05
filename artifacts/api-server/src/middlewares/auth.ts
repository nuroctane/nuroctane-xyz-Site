import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  githubId: number;
  username: string;
  avatarUrl: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set");
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    req.user = jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, getSecret()) as JwtPayload;
  } catch {}
  next();
}
