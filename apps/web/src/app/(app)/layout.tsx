import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const workspaceContext = await resolveWorkspaceContext();

  return (
    <AppShell
      canViewAdmin={workspaceContext.canViewAdmin}
      adminWorkspaceId={workspaceContext.adminWorkspaceId ?? undefined}
      workspaceId={workspaceContext.workspaceId ?? undefined}
      workspaceName={workspaceContext.workspaceName}
      role={workspaceContext.role}
      workspaces={workspaceContext.workspaces}
    >
      {children}
    </AppShell>
  );
}
