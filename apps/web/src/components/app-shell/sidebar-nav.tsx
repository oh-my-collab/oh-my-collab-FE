"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  KanbanSquare,
  ListChecks,
  Settings,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/orgs", label: "조직", icon: Building2 },
  { href: "/board", label: "보드", icon: KanbanSquare },
  { href: "/issues", label: "이슈", icon: ListChecks },
  { href: "/requests", label: "협업 요청", icon: UsersRound },
  { href: "/reports", label: "리포트", icon: ChartNoAxesCombined },
  { href: "/settings", label: "설정", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs font-semibold text-muted-foreground">단축 동선</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" />
            <span>2~3클릭 내 이슈 상태 변경</span>
          </li>
          <li>검색으로 즉시 이슈/요청 이동</li>
          <li>리포트에서 근거 화면으로 드릴다운</li>
        </ul>
      </div>
    </nav>
  );
}
