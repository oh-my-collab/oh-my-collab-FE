import { z } from "zod";

import { getSessionUserId } from "@/lib/auth/session-user";
import { type CollabStore } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
});

type WorkspaceDeps = {
  getUserId: (request: Request) => Promise<string>;
  getStore: () => Promise<CollabStore> | CollabStore;
};

const defaultDeps: WorkspaceDeps = {
  getUserId: (request) => getSessionUserId(request),
  getStore: () => getRuntimeCollabStore(),
};

export function createPostWorkspaceHandler(deps: WorkspaceDeps) {
  return async function POST(request: Request) {
    try {
      const userId = await deps.getUserId(request);
      const store = await deps.getStore();
      const payload = createWorkspaceSchema.parse(await request.json());
      const result = await store.createWorkspaceWithOwner({
        name: payload.name,
        ownerUserId: userId,
      });

      return Response.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            message: "INVALID_INPUT",
            issues: error.issues,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return Response.json({ message: "UNAUTHORIZED" }, { status: 401 });
      }

      return Response.json({ message: "INTERNAL_ERROR" }, { status: 500 });
    }
  };
}

export const POST = createPostWorkspaceHandler(defaultDeps);
