import express from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter } from "./routes/auth";
import { playersRouter } from "./routes/players";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/players", playersRouter);
// TODO: clubs, matches, tournaments...

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
