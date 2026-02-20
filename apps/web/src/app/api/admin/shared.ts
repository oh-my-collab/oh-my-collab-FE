import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import type { CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

export type AdminRouteDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

export const defaultAdminDeps: AdminRouteDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

export function parseWorkspaceIdFromUrl(url: string) {
  const workspaceId = new URL(url).searchParams.get("workspaceId");
  if (!workspaceId) throw new Error("INVALID_INPUT");
  return workspaceId;
}

export async function ensureWorkspaceMember(
  store: CollabStore,
  workspaceId: string,
  userId: string
) {
  if (!(await store.isWorkspaceMember(workspaceId, userId))) {
    throw new Error("FORBIDDEN");
  }
}

export async function ensureWorkspaceAdmin(
  store: CollabStore,
  workspaceId: string,
  userId: string
) {
  if (!(await store.isWorkspaceAdmin(workspaceId, userId))) {
    throw new Error("FORBIDDEN");
  }
}

export async function ensureWorkspaceOwner(
  store: CollabStore,
  workspaceId: string,
  userId: string
) {
  const membership = await store.getWorkspaceMembership(workspaceId, userId);
  if (!membership || membership.role !== "owner") {
    throw new Error("FORBIDDEN");
  }
}

export const performanceWeightsSchema = z
  .object({
    execution: z.number().min(0).max(100),
    docs: z.number().min(0).max(100),
    goals: z.number().min(0).max(100),
    collaboration: z.number().min(0).max(100),
  })
  .superRefine((weights, ctx) => {
    const sum =
      weights.execution + weights.docs + weights.goals + weights.collaboration;
    if (Math.abs(sum - 100) > 0.001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weights"],
        message: "weights total must be 100",
      });
    }
  });

export function handleAdminError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json(
      { message: "INVALID_INPUT", issues: error.issues },
      { status: 400 }
    );
  }
  if (error instanceof Error && error.message === "INVALID_INPUT") {
    return Response.json({ message: "INVALID_INPUT" }, { status: 400 });
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return Response.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return Response.json({ message: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return Response.json({ message: "NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof Error && error.message === "INVALID_ROLE_CHANGE") {
    return Response.json({ message: "INVALID_ROLE_CHANGE" }, { status: 409 });
  }
  if (error instanceof Error && error.message === "REVIEW_LOCKED") {
    return Response.json({ message: "REVIEW_LOCKED" }, { status: 409 });
  }
  return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
}
