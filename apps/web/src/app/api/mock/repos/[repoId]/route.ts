import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { getOrganizationById, getRepositoryById, listIssues } from "@/features/shared/mock-store";

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

    const issues = listIssues({ repoId });
    return Response.json(
      {
        repository,
        summary: {
          openIssueCount: issues.filter((issue) => issue.status !== "done").length,
          doneIssueCount: issues.filter((issue) => issue.status === "done").length,
          highPriorityCount: issues.filter(
            (issue) => issue.priority === "high" || issue.priority === "urgent"
          ).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
