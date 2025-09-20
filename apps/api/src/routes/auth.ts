import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { z } from "zod";

export const authRouter = Router();

const verifySchema = z.object({
  idToken: z.string(),
});

authRouter.post("/verify", async (req, res, next) => {
  try {
    const { idToken } = verifySchema.parse(req.body);
    const decoded = await getAuth().verifyIdToken(idToken);
    res.json({
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      expiresAt: decoded.exp,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
      return;
    }
    next(error);
  }
});
