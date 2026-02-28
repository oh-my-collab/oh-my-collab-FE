import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { updateIssueSchema } from "@/features/shared/schemas";
import {
  addIssueComment,
  getIssueById,
  getOrganizationById,
  listIssueComments,
  listUsers,
  updateIssue,
} from "@/features/shared/mock-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ issueId: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const { issueId } = await context.params;
    const issue = getIssueById(issueId);
    if (!issue) throw new Error("NOT_FOUND");

    const org = getOrganizationById(issue.orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    return Response.json(
      {
        issue,
        comments: listIssueComments(issueId),
        users: listUsers(),
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ issueId: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const { issueId } = await context.params;
    const issue = getIssueById(issueId);
    if (!issue) throw new Error("NOT_FOUND");

    const org = getOrganizationById(issue.orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const payload = updateIssueSchema.parse(await request.json());
    const updated = updateIssue(issueId, {
      ...payload,
      assigneeId: payload.assigneeId,
    });

    if (!updated) throw new Error("NOT_FOUND");

    if (payload.comment) {
      addIssueComment(issueId, userId, payload.comment);
    }

    return Response.json(
      {
        issue: updated,
        comments: listIssueComments(issueId),
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
