import type {
  UserWorkspaceSummary,
  WorkspaceMembership,
} from "@/lib/data/collab-store";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";

export type WorkspaceContext = {
  userId: string | null;
  workspaceId: string | null;
  workspaceName: string;
  role: WorkspaceMembership["role"] | null;
  selectedRole: WorkspaceMembership["role"] | null;
  adminWorkspaceId: string | null;
  canViewAdmin: boolean;
  workspaces: UserWorkspaceSummary[];
  memberships: WorkspaceMembership[];
};

const EMPTY_CONTEXT: WorkspaceContext = {
  userId: null,
  workspaceId: null,
  workspaceName: "워크스페이스 미지정",
  role: null,
  selectedRole: null,
  adminWorkspaceId: null,
  canViewAdmin: false,
  workspaces: [],
  memberships: [],
};

export async function resolveWorkspaceContext(preferredWorkspaceId?: string | null) {
  try {
    const userId = await getSessionUserId();
    const store = await getRuntimeCollabStore();
    const [memberships, workspaces] = await Promise.all([
      store.listMembershipsByUser(userId),
      store.listWorkspacesByUser(userId),
    ]);

    if (workspaces.length === 0) {
      return {
        ...EMPTY_CONTEXT,
        userId,
      };
    }

    const selectedWorkspace =
      workspaces.find((workspace) => workspace.workspaceId === preferredWorkspaceId) ??
      workspaces[0];

    const adminWorkspace =
      selectedWorkspace.role === "owner" || selectedWorkspace.role === "admin"
        ? selectedWorkspace
        : workspaces.find(
            (workspace) =>
              workspace.role === "owner" || workspace.role === "admin"
          ) ?? null;

    const selectedMembership =
      memberships.find(
        (membership) => membership.workspaceId === selectedWorkspace.workspaceId
      ) ?? memberships[0];

    return {
      userId,
      workspaceId: selectedWorkspace.workspaceId,
      workspaceName: selectedWorkspace.workspaceName,
      role: selectedWorkspace.role,
      selectedRole: selectedWorkspace.role,
      adminWorkspaceId: adminWorkspace?.workspaceId ?? null,
      canViewAdmin:
        selectedWorkspace.role === "owner" || selectedWorkspace.role === "admin",
      workspaces,
      memberships,
    };
  } catch {
    return EMPTY_CONTEXT;
  }
}
