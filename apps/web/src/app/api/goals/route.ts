import { z } from "zod";

import { getRequestUserId } from "@/lib/auth/request-user";
import { collabStore, type CollabStore } from "@/lib/data/collab-store";

const createGoalSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
});

type GoalDeps = {
  getUserId: (request: Request) => Promise<string>;
  store: CollabStore;
};

const defaultDeps: GoalDeps = {
  getUserId: getRequestUserId,
  store: collabStore,
};

function getWorkspaceIdFromUrl(url: string) {
  const workspaceId = new URL(url).searchParams.get("workspaceId");
  if (!workspaceId) throw new Error("INVALID_INPUT");
  return workspaceId;
}

function ensureWorkspaceAccess(store: CollabStore, workspaceId: string, userId: string) {
  if (!store.isWorkspaceMember(workspaceId, userId)) {
    throw new Error("FORBIDDEN");
  }
}

function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({ message: "INVALID_INPUT", issues: error.issues }, { status: 400 });
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
  return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
}

export function createGoalHandlers(deps: GoalDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const workspaceId = getWorkspaceIdFromUrl(request.url);
        ensureWorkspaceAccess(deps.store, workspaceId, userId);

        return Response.json(
          { goals: deps.store.listGoalsByWorkspace(workspaceId) },
          { status: 200 }
        );
      } catch (error) {
        return handleError(error);
      }
    },

    POST: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const payload = createGoalSchema.parse(await request.json());
        ensureWorkspaceAccess(deps.store, payload.workspaceId, userId);

        const goal = deps.store.createGoal({
          workspaceId: payload.workspaceId,
          title: payload.title,
          description: payload.description,
          targetDate: payload.targetDate,
          userId,
        });

        return Response.json({ goal }, { status: 201 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createGoalHandlers(defaultDeps);

export const GET = handlers.GET;
export const POST = handlers.POST;
