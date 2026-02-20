import { z } from "zod";

import {
  defaultAdminDeps,
  ensureWorkspaceAdmin,
  handleAdminError,
  parseWorkspaceIdFromUrl,
  performanceWeightsSchema,
  type AdminRouteDeps,
} from "../shared";

const createCycleSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1).max(200),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  status: z.enum(["draft", "open", "closed"]).optional(),
  weights: performanceWeightsSchema,
});

export function createAdminCyclesHandlers(deps: AdminRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const workspaceId = parseWorkspaceIdFromUrl(request.url);
        await ensureWorkspaceAdmin(store, workspaceId, userId);

        const cycles = await store.listPerformanceCyclesByWorkspace(workspaceId);
        return Response.json({ cycles }, { status: 200 });
      } catch (error) {
        return handleAdminError(error);
      }
    },

    POST: async (request: Request) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = createCycleSchema.parse(await request.json());
        await ensureWorkspaceAdmin(store, payload.workspaceId, userId);

        const cycle = await store.createPerformanceCycle({
          workspaceId: payload.workspaceId,
          title: payload.title,
          periodStart: payload.periodStart,
          periodEnd: payload.periodEnd,
          status: payload.status,
          weights: payload.weights,
          actorUserId: userId,
        });

        return Response.json({ cycle }, { status: 201 });
      } catch (error) {
        return handleAdminError(error);
      }
    },
  };
}

const handlers = createAdminCyclesHandlers(defaultAdminDeps);

export const GET = handlers.GET;
export const POST = handlers.POST;
