import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import { type CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const reorderTasksSchema = z.object({
  workspaceId: z.string().min(1),
  orderedTaskIds: z.array(z.string().min(1)).min(1),
});

type ReorderDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: ReorderDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

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
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return Response.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return Response.json({ message: "FORBIDDEN" }, { status: 403 });
  }
  return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
}

export function createTaskReorderHandlers(deps: ReorderDeps) {
  return {
    PATCH: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = reorderTasksSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);

        const tasks = await store.reorderTasks({
          workspaceId: payload.workspaceId,
          orderedTaskIds: payload.orderedTaskIds,
          userId,
        });

        return Response.json({ tasks }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createTaskReorderHandlers(defaultDeps);

export const PATCH = handlers.PATCH;
