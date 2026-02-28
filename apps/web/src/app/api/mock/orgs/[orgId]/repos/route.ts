import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { getOrganizationById, listRepositoriesByOrg } from "@/features/shared/mock-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const { orgId } = await context.params;
    const organization = getOrganizationById(orgId);
    if (!organization) throw new Error("NOT_FOUND");
    if (!organization.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const repositories = listRepositoriesByOrg(orgId);
    return Response.json({ repositories }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
