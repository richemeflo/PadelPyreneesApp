import "dotenv/config";

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { authRouter } from "./routes/auth";
import { clubsRouter, courtsRouter } from "./routes/clubs";
import { matchmakingRouter } from "./routes/matchmaking";
import { matchesRouter } from "./routes/matches";
import { playersRouter, rankingRouter } from "./routes/players";
import { reservationsRouter } from "./routes/reservations";
import { tournamentsRouter } from "./routes/tournaments";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/players", playersRouter);
app.use("/ranking", rankingRouter);
app.use("/clubs", clubsRouter);
app.use("/courts", courtsRouter);
app.use("/matches", matchesRouter);
app.use("/tournaments", tournamentsRouter);
app.use("/matchmaking", matchmakingRouter);
app.use("/reservations", reservationsRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation error", details: err.errors });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Unknown error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

export default app;
