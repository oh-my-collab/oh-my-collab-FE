import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { getOrganizationById, getUserReport } from "@/features/shared/mock-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const requesterId = await getSessionUserIdOrThrow(request);
    const { userId } = await context.params;

    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");
    const period = (url.searchParams.get("period") as "week" | "month" | null) ?? "week";
    if (!orgId) throw new Error("INVALID_INPUT");

    const org = getOrganizationById(orgId);
    if (!org || !org.memberIds.includes(requesterId)) throw new Error("FORBIDDEN");

    const report = getUserReport(orgId, userId, period);
    if (!report) throw new Error("NOT_FOUND");

    return Response.json({ report }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
