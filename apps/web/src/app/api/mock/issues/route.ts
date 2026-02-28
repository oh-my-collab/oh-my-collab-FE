import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { createIssueSchema } from "@/features/shared/schemas";
import {
  createIssue,
  getOrganizationById,
  listIssues,
  listUsers,
} from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const url = new URL(request.url);

    const orgId = url.searchParams.get("orgId") ?? undefined;
    const repoId = url.searchParams.get("repoId") ?? undefined;
    const status = (url.searchParams.get("status") as
      | "backlog"
      | "in_progress"
      | "review"
      | "done"
      | null) ?? undefined;
    const assigneeId = url.searchParams.get("assigneeId") ?? undefined;
    const label = url.searchParams.get("label") ?? undefined;
    const fromDate = url.searchParams.get("fromDate") ?? undefined;
    const toDate = url.searchParams.get("toDate") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;

    if (orgId) {
      const org = getOrganizationById(orgId);
      if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");
    }

    const issues = listIssues({
      orgId,
      repoId,
      status,
      assigneeId,
      label,
      fromDate,
      toDate,
      q,
    });

    return Response.json({ issues, users: listUsers() }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const payload = createIssueSchema.parse(await request.json());

    const org = getOrganizationById(payload.orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const issue = createIssue(payload);
    return Response.json({ issue }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
