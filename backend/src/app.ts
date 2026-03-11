import express from "express";
import cors from "cors";
import routes from "./routes/index";
import { connectDB } from "./lib/db";
import { startWatcher } from "./lib/watcher";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

connectDB().then(() => startWatcher());

export default app;