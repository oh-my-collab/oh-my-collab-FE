"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  href: string;
  label: string;
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
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100"
              } ${collapsed ? "text-center" : "text-left"}`}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </Link>
          );
        })}
    </nav>
  );
}
