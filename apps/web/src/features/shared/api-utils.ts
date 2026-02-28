import { z } from "zod";

export function jsonError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json(
      { message: "INVALID_INPUT", issues: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return Response.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return Response.json({ message: "FORBIDDEN" }, { status: 403 });
    }
    if (error.message === "NOT_FOUND") {
      return Response.json({ message: "NOT_FOUND" }, { status: 404 });
    }
    if (error.message === "INVALID_INPUT") {
      return Response.json({ message: "INVALID_INPUT" }, { status: 400 });
    }
  }

  return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
}
