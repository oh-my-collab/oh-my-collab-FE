import { z } from "zod";

import {
  defaultAdminDeps,
  ensureWorkspaceAdmin,
  handleAdminError,
  type AdminRouteDeps,
} from "../shared";

const patchReviewSchema = z.object({
  workspaceId: z.string().min(1),
  cycleId: z.string().min(1),
  userId: z.string().min(1),
  managerNote: z.string().optional(),
  finalRating: z.string().optional(),
  lock: z.boolean().optional(),
});

function parseReviewQuery(url: string) {
  const searchParams = new URL(url).searchParams;
  const workspaceId = searchParams.get("workspaceId");
  const cycleId = searchParams.get("cycleId");
  const userId = searchParams.get("userId");
  if (!workspaceId || !cycleId || !userId) {
    throw new Error("INVALID_INPUT");
  }
  return { workspaceId, cycleId, userId };
}

export function createAdminReviewsHandlers(deps: AdminRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const requesterId = await deps.getUserId(request);
        const store = await deps.getStore();
        const { workspaceId, cycleId, userId } = parseReviewQuery(request.url);
        await ensureWorkspaceAdmin(store, workspaceId, requesterId);

        const evidence = await store.buildEvidencePack(workspaceId, cycleId, userId);
        if (!evidence) throw new Error("NOT_FOUND");

        const existing = await store.getPerformanceReview(workspaceId, cycleId, userId);

        return Response.json(
          {
            evidencePack: evidence.evidencePack,
            scorePreview: evidence.scorePreview,
            managerNote: existing?.managerNote ?? null,
            finalRating: existing?.finalRating ?? null,
            lockedAt: existing?.lockedAt ?? null,
          },
          { status: 200 }
        );
      } catch (error) {
        return handleAdminError(error);
      }
    },

    PATCH: async (request: Request) => {
      try {
        const requesterId = await deps.getUserId(request);
        const store = await deps.getStore();
        const payload = patchReviewSchema.parse(await request.json());
        await ensureWorkspaceAdmin(store, payload.workspaceId, requesterId);

        const review = await store.upsertPerformanceReview({
          workspaceId: payload.workspaceId,
          cycleId: payload.cycleId,
          userId: payload.userId,
          managerNote: payload.managerNote,
          finalRating: payload.finalRating,
          lock: payload.lock,
          updatedBy: requesterId,
        });

        if (!review) {
          throw new Error("NOT_FOUND");
        }

        return Response.json({ review }, { status: 200 });
      } catch (error) {
        return handleAdminError(error);
      }
    },
  };
}

const handlers = createAdminReviewsHandlers(defaultAdminDeps);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
