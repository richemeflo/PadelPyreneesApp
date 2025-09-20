import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { NextFunction, Request, Response } from "express";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Convert escaped newlines in the private key to real newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).send("No token");
  try {
    const decoded = await getAuth().verifyIdToken(auth.slice(7));
    req.firebaseUser = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

export function requireFirebaseUser(req: Request) {
  const user = req.firebaseUser;
  if (!user) {
    throw new Error("Missing authenticated user in request context");
  }
  return user;
}
