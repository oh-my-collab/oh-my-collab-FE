import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import {
  type CollabStore,
  type TaskPriority,
} from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  checklist: z.array(z.string()).optional(),
  repeat: z.enum(["none", "daily", "weekly"]).optional(),
  sprintKey: z.string().min(1).max(120).optional(),
  isBlocked: z.boolean().optional(),
  blockedReason: z.string().max(500).optional(),
  sortOrder: z.number().min(0).optional(),
});

type TaskDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: TaskDeps = {
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

export function createTaskHandlers(deps: TaskDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAccess(store, workspaceId, userId);

        return Response.json(
          { tasks: await store.listTasksByWorkspace(workspaceId) },
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
        const payload = createTaskSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);

        const task = await store.createTask({
          workspaceId: payload.workspaceId,
          title: payload.title,
          description: payload.description,
          assigneeId: payload.assigneeId,
          priority: payload.priority as TaskPriority | undefined,
          dueDate: payload.dueDate,
          difficulty: payload.difficulty,
          checklist: payload.checklist,
          repeat: payload.repeat,
          sprintKey: payload.sprintKey,
          isBlocked: payload.isBlocked,
          blockedReason: payload.blockedReason,
          sortOrder: payload.sortOrder,
          createdBy: userId,
        });

        return Response.json({ task }, { status: 201 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createTaskHandlers(defaultDeps);

export const GET = handlers.GET;
export const POST = handlers.POST;
