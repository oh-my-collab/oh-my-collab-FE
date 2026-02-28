import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { getOrganizationById, getTeamReport } from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");
    const period = (url.searchParams.get("period") as "week" | "month" | null) ?? "week";
    if (!orgId) throw new Error("INVALID_INPUT");

    const org = getOrganizationById(orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const report = getTeamReport(orgId, period);
    if (!report) throw new Error("NOT_FOUND");

    return Response.json({ report }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
