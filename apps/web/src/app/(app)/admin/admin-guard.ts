import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/auth/session-user";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

function pickWorkspaceId(
  searchParams: Record<string, string | string[] | undefined>
) {
  const candidate = searchParams.workspaceId;
  if (Array.isArray(candidate)) return candidate[0];
  return candidate;
}

export async function requireAdminAccess(searchParams: SearchParams) {
  const resolvedParams = await Promise.resolve(searchParams);
  const userId = await getSessionUserId().catch(() => {
    redirect("/setup");
  });

  const store = await getRuntimeCollabStore();
  const memberships = await store.listMembershipsByUser(userId);
  if (memberships.length === 0) {
    redirect("/setup");
  }

  const preferredWorkspaceId =
    pickWorkspaceId(resolvedParams) ?? memberships[0].workspaceId;
  const membership = await store.getWorkspaceMembership(
    preferredWorkspaceId,
    userId
  );
  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    redirect("/tasks");
  }

  return {
    workspaceId: preferredWorkspaceId,
    role: membership.role,
  };
}
