import { z } from "zod";

import {
  defaultAdminDeps,
  ensureWorkspaceAdmin,
  handleAdminError,
  performanceWeightsSchema,
  type AdminRouteDeps,
} from "../../shared";

const updateCycleSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  periodStart: z.string().min(1).optional(),
  periodEnd: z.string().min(1).optional(),
  status: z.enum(["draft", "open", "closed"]).optional(),
  weights: performanceWeightsSchema.optional(),
});

export function createAdminCycleDetailHandlers(deps: AdminRouteDeps) {
  return {
    PATCH: async (
      request: Request,
      context: { params: Promise<{ cycleId: string }> }
    ) => {
      try {
        const userId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = updateCycleSchema.parse(await request.json());
        await ensureWorkspaceAdmin(store, payload.workspaceId, userId);
        const { cycleId } = await context.params;

        const cycle = await store.updatePerformanceCycle({
          cycleId,
          workspaceId: payload.workspaceId,
          title: payload.title,
          periodStart: payload.periodStart,
          periodEnd: payload.periodEnd,
          status: payload.status,
          weights: payload.weights,
          actorUserId: userId,
        });

        if (!cycle) {
          throw new Error("NOT_FOUND");
        }

        return Response.json({ cycle }, { status: 200 });
      } catch (error) {
        return handleAdminError(error);
      }
    },
  };
}

const handlers = createAdminCycleDetailHandlers(defaultAdminDeps);

export const PATCH = handlers.PATCH;
