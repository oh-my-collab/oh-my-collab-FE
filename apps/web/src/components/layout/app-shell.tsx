"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type {
  UserWorkspaceSummary,
  WorkspaceMembership,
} from "@/lib/data/collab-store";
import { APP_NAV_ITEMS, ROLE_COPY } from "@/lib/ui/copy";

import { CommandPalette } from "./command-palette";
import { Sidebar, type SidebarItem } from "./sidebar";

const STORAGE_KEY = "omc.sidebar.collapsed";
const SIDEBAR_NAV_ID = "app-sidebar-nav";
const MOBILE_DRAWER_ID = "app-mobile-sidebar";

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [] as HTMLElement[];
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const path =
    direction === "left"
      ? "M10.5 4.5L6 9l4.5 4.5"
      : "M7.5 4.5L12 9l-4.5 4.5";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function createWorkspaceHref(path: string, workspaceId?: string) {
  if (!workspaceId) return path;
  return `${path}?workspaceId=${encodeURIComponent(workspaceId)}`;
}

type AppShellProps = {
  children: React.ReactNode;
  canViewAdmin: boolean;
  adminWorkspaceId?: string;
  workspaceId?: string;
  workspaceName: string;
  role: WorkspaceMembership["role"] | null;
  workspaces: UserWorkspaceSummary[];
};

export function AppShell({
  children,
  canViewAdmin,
  adminWorkspaceId,
  workspaceId,
  workspaceName,
  role,
  workspaces,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLElement | null>(null);
  const canAccessAdmin = canViewAdmin || Boolean(adminWorkspaceId);

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

  useEffect(() => {
    if (!mobileOpen) return;

    const activeBeforeOpen = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = getFocusableElements(mobileDrawerRef.current);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableInDrawer = getFocusableElements(mobileDrawerRef.current);
      if (focusableInDrawer.length === 0) return;

      const first = focusableInDrawer[0];
      const last = focusableInDrawer[focusableInDrawer.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      activeBeforeOpen?.focus();
    };
  }, [mobileOpen]);

  const navItems = useMemo<SidebarItem[]>(
    () =>
      APP_NAV_ITEMS.map((item) => ({
        ...item,
        href: createWorkspaceHref(
          item.path,
          item.adminOnly ? adminWorkspaceId ?? workspaceId : workspaceId
        ),
      })),
    [adminWorkspaceId, workspaceId]
  );

  const currentLabel = useMemo(() => {
    const matched = navItems.find(
      (item) =>
        pathname === item.path ||
        (item.path !== "/" && pathname.startsWith(`${item.path}/`))
    );
    return matched?.label ?? "협업 공간";
  }, [navItems, pathname]);

  const sidebarWidthClass = collapsed ? "lg:w-28" : "lg:w-72";
  const roleLabel = role ? ROLE_COPY[role] : "권한 미확인";
  const toggleLabel = collapsed ? "사이드바 펼치기" : "사이드바 접기";

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const changeWorkspace = (nextWorkspaceId: string) => {
    const target = createWorkspaceHref("/overview", nextWorkspaceId);
    router.push(target);
    setMobileOpen(false);
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
              aria-label={toggleLabel}
              aria-controls={SIDEBAR_NAV_ID}
              aria-expanded={!collapsed}
              title={toggleLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line-default)] text-[var(--ink-default)] transition hover:bg-[var(--surface-soft)]"
              onClick={toggleCollapse}
            >
              <ChevronIcon direction={collapsed ? "right" : "left"} />
            </button>
          </div>

          <Sidebar
            id={SIDEBAR_NAV_ID}
            collapsed={collapsed}
            canViewAdmin={canAccessAdmin}
            items={navItems}
          />
        </aside>

        <div className="min-h-screen min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line-default)] bg-[var(--surface-raised)]/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="메뉴 열기"
                aria-expanded={mobileOpen}
                aria-controls={MOBILE_DRAWER_ID}
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
              {workspaces.length > 1 && (
                <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-2 py-1 text-xs text-[var(--ink-default)]">
                  <span>워크스페이스</span>
                  <select
                    value={workspaceId ?? workspaces[0]?.workspaceId ?? ""}
                    onChange={(event) => changeWorkspace(event.target.value)}
                    className="field-input py-1 text-xs"
                  >
                    {workspaces.map((workspace) => (
                      <option key={workspace.workspaceId} value={workspace.workspaceId}>
                        {workspace.workspaceName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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
          <aside
            id={MOBILE_DRAWER_ID}
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="모바일 사이드바"
            className="absolute left-0 top-0 h-full w-72 border-r border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-4"
          >
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
              canViewAdmin={canAccessAdmin}
              items={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {commandOpen && (
        <CommandPalette
          items={navItems.filter((item) => !item.adminOnly || canAccessAdmin)}
          onClose={() => setCommandOpen(false)}
        />
      )}
    </div>
  );
}
