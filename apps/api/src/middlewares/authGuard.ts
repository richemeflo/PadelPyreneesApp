import { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../lib/jwt";

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).send("No token");
  const token = auth.slice(7);

  const jwtUser = verifyAuthToken(token);
  if (jwtUser) {
    req.firebaseUser = {
      uid: jwtUser.uid,
      email: jwtUser.email ?? null,
      name: null,
      provider: "jwt",
    };
    next();
    return;
  }

  res.status(401).send("Invalid token");
}

export function requireFirebaseUser(req: Request) {
  const user = req.firebaseUser;
  if (!user) {
    throw new Error("Missing authenticated user in request context");
  }
  return user;
}
