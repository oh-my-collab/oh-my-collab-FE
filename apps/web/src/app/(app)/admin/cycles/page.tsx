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
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">관리</p>
        <h1 className="page-title">평가 주기와 가중치</h1>
        <p className="page-subtitle">
          주기별 가중치를 설정하고 평가 진행 상태를 관리합니다.
        </p>
      </header>

      <CyclesManager workspaceId={workspaceId} />
    </main>
  );
}
