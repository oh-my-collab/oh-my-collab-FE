"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/setup", label: "설정" },
  { href: "/tasks", label: "작업" },
  { href: "/goals", label: "목표" },
  { href: "/docs", label: "문서" },
  { href: "/insights", label: "인사이트" },
] as const;

type AppNavigationProps = {
  orientation?: "vertical" | "horizontal";
};

export function AppNavigation({ orientation = "vertical" }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="앱 주요 메뉴"
      className={
        orientation === "vertical" ? "flex flex-col gap-1.5" : "flex flex-wrap gap-2"
      }
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/setup"
            ? pathname === "/setup"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            data-active={isActive ? "true" : "false"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
