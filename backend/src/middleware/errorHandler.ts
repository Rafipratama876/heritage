import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/asyncHandler";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Prisma known request errors (e.g. unique constraint violations)
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      return res.status(409).json({
        error: `A record with this ${prismaErr.meta?.target?.join(", ") ?? "value"} already exists`,
      });
    }
    if (prismaErr.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Internal server error" : message });
}
