import type { WorkspaceMembership } from "@/lib/data/collab-store";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

export type WorkspaceContext = {
  userId: string | null;
  workspaceId: string | null;
  workspaceName: string;
  role: WorkspaceMembership["role"] | null;
  canViewAdmin: boolean;
  memberships: WorkspaceMembership[];
};

const EMPTY_CONTEXT: WorkspaceContext = {
  userId: null,
  workspaceId: null,
  workspaceName: "워크스페이스 미지정",
  role: null,
  canViewAdmin: false,
  memberships: [],
};

export async function resolveWorkspaceContext(preferredWorkspaceId?: string | null) {
  try {
    const userId = await getSessionUserId();
    const store = await getRuntimeCollabStore();
    const memberships = await store.listMembershipsByUser(userId);

    if (memberships.length === 0) {
      return {
        ...EMPTY_CONTEXT,
        userId,
      };
    }

    const selectedMembership =
      memberships.find((membership) => membership.workspaceId === preferredWorkspaceId) ??
      memberships[0];

    return {
      userId,
      workspaceId: selectedMembership.workspaceId,
      workspaceName: selectedMembership.workspaceId,
      role: selectedMembership.role,
      canViewAdmin: memberships.some(
        (membership) =>
          membership.role === "owner" || membership.role === "admin"
      ),
      memberships,
    };
  } catch {
    return EMPTY_CONTEXT;
  }
}
