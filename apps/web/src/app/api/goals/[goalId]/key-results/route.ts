import { z } from "zod";

import { getRequestUserId } from "@/lib/auth/request-user";
import { collabStore, type CollabStore } from "@/lib/data/collab-store";

const createKeyResultSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  metric: z.string().min(1),
  targetValue: z.number(),
});

const updateProgressSchema = z.object({
  workspaceId: z.string().min(1),
  keyResultId: z.string().min(1),
  progress: z.number().min(0).max(100),
  currentValue: z.number().optional(),
});

type GoalKeyResultDeps = {
  getUserId: (request: Request) => Promise<string>;
  store: CollabStore;
};

const defaultDeps: GoalKeyResultDeps = {
  getUserId: getRequestUserId,
  store: collabStore,
};

function ensureWorkspaceAccess(store: CollabStore, workspaceId: string, userId: string) {
  if (!store.isWorkspaceMember(workspaceId, userId)) {
    throw new Error("FORBIDDEN");
  }
}

function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({ message: "INVALID_INPUT", issues: error.issues }, { status: 400 });
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return Response.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return Response.json({ message: "FORBIDDEN" }, { status: 403 });
  }
  return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
}

export function createGoalKeyResultHandlers(deps: GoalKeyResultDeps) {
  return {
    POST: async (request: Request, context: { params: Promise<{ goalId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const payload = createKeyResultSchema.parse(await request.json());
        ensureWorkspaceAccess(deps.store, payload.workspaceId, userId);
        const { goalId } = await context.params;

        const keyResult = deps.store.createKeyResult({
          goalId,
          workspaceId: payload.workspaceId,
          title: payload.title,
          metric: payload.metric,
          targetValue: payload.targetValue,
          userId,
        });

        if (!keyResult) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ keyResult }, { status: 201 });
      } catch (error) {
        return handleError(error);
      }
    },

    PATCH: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const payload = updateProgressSchema.parse(await request.json());
        ensureWorkspaceAccess(deps.store, payload.workspaceId, userId);

        const keyResult = deps.store.updateKeyResultProgress({
          keyResultId: payload.keyResultId,
          workspaceId: payload.workspaceId,
          progress: payload.progress,
          currentValue: payload.currentValue,
          userId,
        });

        if (!keyResult) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ keyResult }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createGoalKeyResultHandlers(defaultDeps);

export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
