"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  path: string;
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

type SidebarProps = {
  id?: string;
  collapsed: boolean;
  canViewAdmin: boolean;
  items: SidebarItem[];
  onNavigate?: () => void;
};

export function Sidebar({
  id,
  collapsed,
  canViewAdmin,
  items,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav id={id} className="flex flex-col gap-1 py-3">
      {items
        .filter((item) => !item.adminOnly || canViewAdmin)
        .map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              href={item.href}
              className={`group rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-[var(--primary-400)] bg-[rgba(43,99,217,0.12)] text-[var(--primary-700)]"
                  : "border-transparent text-[var(--ink-default)] hover:border-[var(--line-default)] hover:bg-[var(--surface-soft)]"
              } ${collapsed ? "text-center" : "text-left"}`}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              {collapsed ? (
                <span
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--line-soft)] bg-[var(--surface-base)] px-2 py-1 text-xs font-semibold text-[var(--ink-subtle)]"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[var(--line-soft)] bg-[var(--surface-base)] px-1 text-[11px] font-semibold text-[var(--ink-subtle)]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
