import { CyclesManager } from "@/components/admin/cycles-manager";

import { requireAdminAccess } from "../admin-guard";

type AdminCyclesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCyclesPage({
  searchParams,
}: AdminCyclesPageProps) {
  const { workspaceId } = await requireAdminAccess(searchParams);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          평가 주기와 가중치
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          주기별 가중치를 설정하고 평가 진행 상태를 관리합니다.
        </p>
      </header>

      <CyclesManager workspaceId={workspaceId} />
    </main>
  );
}
