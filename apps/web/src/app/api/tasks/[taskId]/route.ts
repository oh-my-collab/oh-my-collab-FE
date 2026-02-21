import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import {
  type CollabStore,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const updateTaskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
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

type TaskByIdDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: TaskByIdDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

function getWorkspaceIdFromRequest(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
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

export function createTaskByIdHandlers(deps: TaskByIdDeps) {
  return {
    PATCH: async (request: Request, context: { params: Promise<{ taskId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = updateTaskSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);
        const { taskId } = await context.params;

        const task = await store.updateTask({
          taskId,
          workspaceId: payload.workspaceId,
          userId,
          title: payload.title,
          description: payload.description,
          status: payload.status as TaskStatus | undefined,
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
        });

        if (!task) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ task }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },

    DELETE: async (request: Request, context: { params: Promise<{ taskId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromRequest(request);
        await ensureWorkspaceAccess(store, workspaceId, userId);
        const { taskId } = await context.params;

        const deleted = await store.deleteTask(workspaceId, taskId);
        if (!deleted) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ success: true }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createTaskByIdHandlers(defaultDeps);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
