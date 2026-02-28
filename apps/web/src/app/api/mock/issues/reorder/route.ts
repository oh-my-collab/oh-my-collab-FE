import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { issueReorderSchema } from "@/features/shared/schemas";
import {
  getOrganizationById,
  reorderIssues,
} from "@/features/shared/mock-store";

export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const payload = issueReorderSchema.parse(await request.json());

    const org = getOrganizationById(payload.orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const issues = reorderIssues(payload.orgId, payload.repoId, payload.buckets);
    return Response.json({ issues }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
