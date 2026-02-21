import type { ReactNode } from "react";
import Link from "next/link";

type MarketingLayoutProps = {
  children: ReactNode;
};

const LINKS = [
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/docs", label: "Docs" },
  { href: "/insights", label: "Insights" },
  { href: "/setup", label: "Setup" },
];

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
              oh-my-collab
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              협업 공간 초기 설정
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
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
