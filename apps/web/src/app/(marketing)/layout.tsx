import type { ReactNode } from "react";
import Link from "next/link";

type MarketingLayoutProps = {
  children: ReactNode;
};

const LINKS = [
  { href: "/tasks", label: "작업" },
  { href: "/goals", label: "목표" },
  { href: "/docs", label: "문서" },
  { href: "/insights", label: "인사이트" },
  { href: "/setup", label: "설정" },
];

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line-default)] bg-[var(--surface-raised)]/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
              oh-my-collab
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">
              협업 공간 초기 설정
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm text-[var(--ink-default)] transition hover:border-[var(--primary-400)] hover:bg-[var(--surface-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full px-4 py-5 md:px-6 md:py-6">{children}</main>
    </div>
  );
}
