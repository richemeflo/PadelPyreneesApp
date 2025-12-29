import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { signAuthToken } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { prisma } from "../lib/prisma";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  pseudo: z.string().min(3).max(40),
  password: z.string().min(6).max(200),
  locale: z.string().min(2).max(10).optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1).max(200),
  password: z.string().min(6).max(200),
});

const navigationSchema = z.object({
  path: z.string().min(1).max(2048),
});

function requestMetadata(req: {
  get: (key: string) => string | undefined;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}) {
  const userAgent = req.get("user-agent") ?? null;
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();
  const ip = forwardedIp ?? req.ip ?? null;
  return { userAgent, ip };
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const email = payload.email.trim().toLowerCase();
    const pseudo = payload.pseudo.trim();
    const passwordHash = await hashPassword(payload.password);

    const player = await prisma.player.create({
      data: {
        email,
        pseudo,
        passwordHash,
        locale: payload.locale ?? "fr",
      },
    });

    const token = signAuthToken({
      uid: player.id,
      email: player.email,
      pseudo: player.pseudo,
    });

    const { userAgent, ip } = requestMetadata(req);
    await prisma.authEvent.create({
      data: {
        playerId: player.id,
        type: "LOGIN",
        ip,
        userAgent,
      },
    });

    res.status(201).json({
      token,
      player: {
        id: player.id,
        email: player.email,
        pseudo: player.pseudo,
        locale: player.locale,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(409).json({ error: "Email or username already exists" });
      return;
    }
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const identifier = payload.identifier.trim();

    const player = await prisma.player.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { pseudo: identifier }],
      },
    });

    if (!player) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await verifyPassword(payload.password, player.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signAuthToken({
      uid: player.id,
      email: player.email,
      pseudo: player.pseudo,
    });

    const { userAgent, ip } = requestMetadata(req);

    await prisma.authEvent.create({
      data: {
        playerId: player.id,
        type: "LOGIN",
        ip,
        userAgent,
      },
    });

    res.json({
      token,
      player: {
        id: player.id,
        email: player.email,
        pseudo: player.pseudo,
        locale: player.locale,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", authGuard, async (req, res, next) => {
  try {
    const auth = requireFirebaseUser(req);
    const { userAgent, ip } = requestMetadata(req);

    await prisma.authEvent.create({
      data: {
        playerId: auth.uid,
        type: "LOGOUT",
        ip,
        userAgent,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/activity", authGuard, async (req, res, next) => {
  try {
    const auth = requireFirebaseUser(req);
    const payload = navigationSchema.parse(req.body);
    const { userAgent, ip } = requestMetadata(req);

    await prisma.authEvent.create({
      data: {
        playerId: auth.uid,
        type: "NAVIGATION",
        path: payload.path,
        ip,
        userAgent,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
