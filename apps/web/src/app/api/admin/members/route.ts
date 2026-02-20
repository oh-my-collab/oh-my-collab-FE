import { z } from "zod";

import {
  defaultAdminDeps,
  ensureWorkspaceAdmin,
  ensureWorkspaceOwner,
  handleAdminError,
  parseWorkspaceIdFromUrl,
  type AdminRouteDeps,
} from "../shared";

const updateMemberRoleSchema = z.object({
  workspaceId: z.string().min(1),
  targetUserId: z.string().min(1),
  role: z.enum(["admin", "member"]),
});

export function createAdminMembersHandlers(deps: AdminRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = parseWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAdmin(store, workspaceId, userId);

        const members = await store.listMembershipsByWorkspace(workspaceId);
        return Response.json({ members }, { status: 200 });
      } catch (error) {
        return handleAdminError(error);
      }
    },

    PATCH: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = updateMemberRoleSchema.parse(await request.json());
        await ensureWorkspaceOwner(store, payload.workspaceId, userId);

        const membership = await store.updateWorkspaceMembershipRole({
          workspaceId: payload.workspaceId,
          targetUserId: payload.targetUserId,
          role: payload.role,
          actorUserId: userId,
        });

        if (!membership) {
          throw new Error("NOT_FOUND");
        }

        return Response.json({ membership }, { status: 200 });
      } catch (error) {
        return handleAdminError(error);
      }
    },
  };
}

const handlers = createAdminMembersHandlers(defaultAdminDeps);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
