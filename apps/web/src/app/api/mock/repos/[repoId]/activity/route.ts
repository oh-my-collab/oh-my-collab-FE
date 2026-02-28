import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import {
  getOrganizationById,
  getRepositoryById,
  listRepoActivity,
} from "@/features/shared/mock-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ repoId: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const { repoId } = await context.params;
    const repository = getRepositoryById(repoId);
    if (!repository) throw new Error("NOT_FOUND");

    const organization = getOrganizationById(repository.orgId);
    if (!organization || !organization.memberIds.includes(userId)) {
      throw new Error("FORBIDDEN");
    }

    const activity = listRepoActivity(repoId);
    return Response.json({ activity }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
