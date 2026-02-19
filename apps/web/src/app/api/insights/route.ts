import { getRequestUserId } from "@/lib/auth/request-user";
import { collabStore, type CollabStore } from "@/lib/data/collab-store";

type InsightsDeps = {
  getUserId: (request: Request) => Promise<string>;
  store: CollabStore;
};

const defaultDeps: InsightsDeps = {
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

export function createInsightsHandlers(deps: InsightsDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const workspaceId = getWorkspaceIdFromUrl(request.url);
        ensureWorkspaceAccess(deps.store, workspaceId, userId);
        const summary = deps.store.getInsights(workspaceId);
        return Response.json(summary, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createInsightsHandlers(defaultDeps);

export const GET = handlers.GET;
