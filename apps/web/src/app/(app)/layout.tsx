import type { ReactNode } from "react";

import { getSessionUserId } from "@/lib/auth/session-user";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { AppShell } from "@/components/layout/app-shell";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  let canViewAdmin = false;

  try {
    const userId = await getSessionUserId();
    const store = await getRuntimeCollabStore();
    const memberships = await store.listMembershipsByUser(userId);
    canViewAdmin = memberships.some(
      (membership) =>
        membership.role === "owner" || membership.role === "admin"
    );
  } catch {
    canViewAdmin = false;
  }

  return <AppShell canViewAdmin={canViewAdmin}>{children}</AppShell>;
}
