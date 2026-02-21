"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { Sidebar, type SidebarItem } from "./sidebar";

const STORAGE_KEY = "omc.sidebar.collapsed";

const NAV_ITEMS: SidebarItem[] = [
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/docs", label: "Docs" },
  { href: "/insights", label: "Insights" },
  { href: "/setup", label: "Setup" },
  { href: "/admin", label: "Admin", adminOnly: true },
];

type AppShellProps = {
  children: React.ReactNode;
  canViewAdmin: boolean;
};

export function AppShell({ children, canViewAdmin }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel = useMemo(() => {
    const matched = NAV_ITEMS.find(
      (item) =>
        pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
    );
    return matched?.label ?? "Workspace";
  }, [pathname]);

  const sidebarWidthClass = collapsed ? "lg:w-20" : "lg:w-72";

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside
          className={`hidden shrink-0 border-r border-[var(--border)] bg-white px-3 py-4 transition-all lg:block ${sidebarWidthClass}`}
        >
          <div className="flex items-center justify-between gap-2 px-1">
            <div className={collapsed ? "hidden" : "block"}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
                oh-my-collab
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Team Workspace
              </p>
            </div>
            <button
              type="button"
              aria-label="Toggle sidebar"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              onClick={toggleCollapse}
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>

          <Sidebar
            collapsed={collapsed}
            canViewAdmin={canViewAdmin}
            items={NAV_ITEMS}
          />
        </aside>

        <div className="min-h-screen min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                Menu
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
                  oh-my-collab
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{currentLabel}</p>
              </div>
            </div>
            <p className="hidden text-xs text-slate-500 md:block">
              실행 데이터와 평가 참고자료를 한 화면에서 관리합니다.
            </p>
          </header>

          <main className="px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-[var(--border)] bg-white px-3 py-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
                  oh-my-collab
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Team Workspace
                </p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                X
              </button>
            </div>
            <Sidebar
              collapsed={false}
              canViewAdmin={canViewAdmin}
              items={NAV_ITEMS}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
