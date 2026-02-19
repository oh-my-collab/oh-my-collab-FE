import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import {
  type CollabStore,
  type DocTemplateKey,
} from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const createDocSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().default(""),
  templateKey: z
    .enum(["meeting-note", "weekly-report", "retrospective", "custom"])
    .default("custom"),
});

type DocsDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: DocsDeps = {
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

export function createDocsHandlers(deps: DocsDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = getWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAccess(store, workspaceId, userId);

        const docs = await store.listDocsByWorkspace(workspaceId);
        return Response.json({ docs }, { status: 200 });
      } catch (error) {
        return handleError(error);
      }
    },

    POST: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = createDocSchema.parse(await request.json());
        await ensureWorkspaceAccess(store, payload.workspaceId, userId);

        const doc = await store.createDoc({
          workspaceId: payload.workspaceId,
          title: payload.title,
          content: payload.content,
          templateKey: payload.templateKey as DocTemplateKey,
          userId,
        });

        return Response.json({ doc }, { status: 201 });
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

const handlers = createDocsHandlers(defaultDeps);

export const GET = handlers.GET;
export const POST = handlers.POST;
