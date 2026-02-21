import { getSessionUserId } from "@/lib/auth/session-user";
import { type CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

type WorkspaceMembersDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: WorkspaceMembersDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

function parseWorkspaceIdFromUrl(url: string) {
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

export function createWorkspaceMembersHandlers(deps: WorkspaceMembersDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = parseWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAccess(store, workspaceId, userId);
        const members = await store.listMembershipsByWorkspace(workspaceId);
        return Response.json({ members }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createWorkspaceMembersHandlers(defaultDeps);

export const GET = handlers.GET;
