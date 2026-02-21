"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  path: string;
  href: string;
  label: string;
  shortLabel: string;
  shortcut: string;
  adminOnly?: boolean;
};

type SidebarProps = {
  collapsed: boolean;
  canViewAdmin: boolean;
  items: SidebarItem[];
  onNavigate?: () => void;
};

export function Sidebar({
  collapsed,
  canViewAdmin,
  items,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 py-3">
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
                <span className="inline-flex w-full items-center justify-center font-semibold">
                  {item.shortLabel}
                </span>
              ) : (
                <span className="flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                  <span className="rounded border border-[var(--line-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ink-subtle)]">
                    {item.shortcut}
                  </span>
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
