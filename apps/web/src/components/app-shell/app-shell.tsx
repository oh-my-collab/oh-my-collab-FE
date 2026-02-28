"use client";

import { OrgRepoSwitcher } from "@/components/app-shell/org-repo-switcher";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopHeader } from "@/components/app-shell/top-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-card p-4 lg:block">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Collaborative OS</p>
            <h1 className="mt-1 text-lg font-semibold">Jira급 협업 UX</h1>
          </div>
          <OrgRepoSwitcher />
          <div className="mt-4 border-t border-border pt-4">
            <SidebarNav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <TopHeader />
          <div className="border-b border-border p-3 lg:hidden">
            <OrgRepoSwitcher />
            <div className="mt-3 rounded-md border border-border p-2">
              <SidebarNav />
            </div>
          </div>
          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
