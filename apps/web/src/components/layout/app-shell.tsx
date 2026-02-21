"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import type { WorkspaceMembership } from "@/lib/data/collab-store";
import { APP_NAV_ITEMS, ROLE_COPY } from "@/lib/ui/copy";

import { CommandPalette } from "./command-palette";
import { Sidebar, type SidebarItem } from "./sidebar";

const STORAGE_KEY = "omc.sidebar.collapsed";

function createWorkspaceHref(path: string, workspaceId?: string) {
  if (!workspaceId) return path;
  return `${path}?workspaceId=${encodeURIComponent(workspaceId)}`;
}

type AppShellProps = {
  children: React.ReactNode;
  canViewAdmin: boolean;
  workspaceId?: string;
  workspaceName: string;
  role: WorkspaceMembership["role"] | null;
};

export function AppShell({
  children,
  canViewAdmin,
  workspaceId,
  workspaceName,
  role,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandPaletteShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      if (isCommandPaletteShortcut) {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navItems = useMemo<SidebarItem[]>(
    () =>
      APP_NAV_ITEMS.map((item) => ({
        ...item,
        href: createWorkspaceHref(item.path, workspaceId),
      })),
    [workspaceId]
  );

  const currentLabel = useMemo(() => {
    const matched = navItems.find(
      (item) =>
        pathname === item.path ||
        (item.path !== "/" && pathname.startsWith(`${item.path}/`))
    );
    return matched?.label ?? "협업 공간";
  }, [navItems, pathname]);

  const sidebarWidthClass = collapsed ? "lg:w-20" : "lg:w-72";
  const roleLabel = role ? ROLE_COPY[role] : "권한 미확인";

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-default)]">
      <div className="flex min-h-screen w-full">
        <aside
          className={`hidden shrink-0 border-r border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-4 transition-all lg:block ${sidebarWidthClass}`}
        >
          <div className="flex items-center justify-between gap-2 px-1">
            <div className={collapsed ? "hidden" : "block"}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
                oh-my-collab
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">
                협업 실행 워크스페이스
              </p>
            </div>
            <button
              type="button"
              aria-label="사이드바 접기"
              className="rounded-md border border-[var(--line-default)] px-2 py-1 text-xs text-[var(--ink-default)] hover:bg-[var(--surface-soft)]"
              onClick={toggleCollapse}
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>

          <Sidebar
            collapsed={collapsed}
            canViewAdmin={canViewAdmin}
            items={navItems}
          />
        </aside>

        <div className="min-h-screen min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line-default)] bg-[var(--surface-raised)]/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="메뉴 열기"
                className="rounded-md border border-[var(--line-default)] px-3 py-1.5 text-sm text-[var(--ink-default)] lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                메뉴
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
                  oh-my-collab
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">{currentLabel}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <span className="status-chip">{workspaceName}</span>
              <span className="status-chip">{roleLabel}</span>
              <button
                type="button"
                className="btn-secondary py-1.5 text-xs"
                onClick={() => setCommandOpen(true)}
              >
                빠른 이동
                <span className="rounded border border-[var(--line-soft)] px-1 text-[10px]">
                  Ctrl/⌘ + K
                </span>
              </button>
            </div>
          </header>

          <main className="px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-[rgba(28,52,110,0.36)]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
                  oh-my-collab
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">
                  협업 실행 워크스페이스
                </p>
              </div>
              <button
                type="button"
                aria-label="메뉴 닫기"
                className="rounded-md border border-[var(--line-default)] px-2 py-1 text-xs text-[var(--ink-default)] hover:bg-[var(--surface-soft)]"
                onClick={() => setMobileOpen(false)}
              >
                닫기
              </button>
            </div>
            <Sidebar
              collapsed={false}
              canViewAdmin={canViewAdmin}
              items={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {commandOpen && (
        <CommandPalette
          items={navItems.filter((item) => !item.adminOnly || canViewAdmin)}
          onClose={() => setCommandOpen(false)}
        />
      )}
    </div>
  );
}
