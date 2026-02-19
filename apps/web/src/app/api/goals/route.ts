import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import { type CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const createGoalSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
});

type GoalDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: GoalDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

function getWorkspaceIdFromUrl(url: string) {
  const workspaceId = new URL(url).searchParams.get("workspaceId");
  if (!workspaceId) throw new Error("INVALID_INPUT");
  return workspaceId;
}

async function ensureWorkspaceAccess(
  store: CollabStore,
  workspaceId: string,
  userId: string
) {
  if (!(await store.isWorkspaceMember(workspaceId, userId))) {
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
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAccess(store, workspaceId, userId);

        return Response.json(
          { goals: await store.listGoalsByWorkspace(workspaceId) },
          { status: 200 }
        );
      } catch (error) {
        return handleError(error);
      }
    },

    POST: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = createGoalSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);

        const goal = await store.createGoal({
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
