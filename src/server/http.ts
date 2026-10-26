import { existsSync } from "node:fs";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import type { Service } from "./checklist.js";
import { NotCheckableError, NotFoundError } from "./errors.js";

const statusFor = (err: unknown): number => {
  if (err instanceof NotFoundError) return 404;
  if (err instanceof NotCheckableError) return 400;
  return 500;
};

/** Builds the HTTP app: GET /api/tree, POST /api/check, and the built web UI from webDir when it exists. */
export function createApp(svc: Service, webDir?: string): Express {
  const app = express();

  app.get("/api/tree", (_req, res) => {
    res.json(svc.tree());
  });

  app.post("/api/check", express.json({ limit: "1kb" }), (req, res) => {
    if (!req.is("application/json")) {
      res.status(415).send("content-type must be application/json");
      return;
    }
    const { id, checked } = req.body ?? {};
    if (!Number.isInteger(id) || typeof checked !== "boolean") {
      res.status(400).send("body must be {id: integer, checked: boolean}");
      return;
    }
    svc.setChecked(id, checked);
    res.status(204).end();
  });

  if (webDir && existsSync(webDir)) app.use(express.static(webDir));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof SyntaxError ? 400 : statusFor(err);
    res.status(status).send(err instanceof Error ? err.message : String(err));
  });

  return app;
}
