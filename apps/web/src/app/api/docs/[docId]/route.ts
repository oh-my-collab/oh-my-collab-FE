import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import { type CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const updateDocSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

type DocByIdDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: DocByIdDeps = {
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

export function createDocByIdHandlers(deps: DocByIdDeps) {
  return {
    GET: async (request: Request, context: { params: Promise<{ docId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromRequest(request);
        await ensureWorkspaceAccess(store, workspaceId, userId);
        const { docId } = await context.params;
        const doc = await store.getDocById(workspaceId, docId);
        if (!doc) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ doc }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },

    PATCH: async (request: Request, context: { params: Promise<{ docId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = updateDocSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);
        const { docId } = await context.params;
        const doc = await store.updateDoc({
          docId,
          workspaceId: payload.workspaceId,
          title: payload.title,
          content: payload.content,
          userId,
        });
        if (!doc) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ doc }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },

    DELETE: async (request: Request, context: { params: Promise<{ docId: string }> }) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromRequest(request);
        await ensureWorkspaceAccess(store, workspaceId, userId);
        const { docId } = await context.params;
        const deleted = await store.deleteDoc(workspaceId, docId);
        if (!deleted) return Response.json({ message: "NOT_FOUND" }, { status: 404 });
        return Response.json({ success: true }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createDocByIdHandlers(defaultDeps);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
