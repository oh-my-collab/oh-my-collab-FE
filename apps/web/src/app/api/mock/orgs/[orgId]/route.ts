import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import {
  getOrganizationById,
  listIssues,
  listRepositoriesByOrg,
} from "@/features/shared/mock-store";

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
    const issues = listIssues({ orgId });

    const openIssueCount = issues.filter((issue) => issue.status !== "done").length;
    const inProgressCount = issues.filter((issue) => issue.status === "in_progress").length;

    return Response.json(
      {
        organization,
        summary: {
          repositoryCount: repositories.length,
          openIssueCount,
          inProgressCount,
          weeklyCommits: repositories.reduce((sum, repo) => sum + repo.weeklyCommits, 0),
          weeklyMerges: repositories.reduce((sum, repo) => sum + repo.weeklyMerges, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
