import type { ReactNode } from "react";
import Link from "next/link";

import { AppNavigation } from "@/components/navigation/app-navigation";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      <div className="mb-4 surface-card p-3 lg:hidden">
        <AppNavigation orientation="horizontal" />
      </div>

      <div className="flex gap-6">
        <aside className="surface-card hidden w-64 shrink-0 flex-col gap-6 p-5 lg:flex">
          <div>
            <p className="page-kicker">Collab Zero</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
              Team Workspace
            </p>
            <p className="muted-copy mt-2 text-sm">
              태스크, 목표, 문서, 인사이트를 한 구조로 관리합니다.
            </p>
          </div>

          <AppNavigation />

          <p className="mt-auto text-xs text-slate-500">
            Built for capstone teams
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
            <div>
              <p className="page-kicker">Workspace Hub</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                Subscription-Free Collaboration Tool
              </p>
            </div>
            <Link className="btn-secondary" href="/setup">
              Setup Guide
            </Link>
          </header>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
