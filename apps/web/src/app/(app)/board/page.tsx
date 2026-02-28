"use client";

import { useEffect } from "react";

import { KanbanBoard } from "@/components/board/kanban-board";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useIssuesQuery } from "@/features/issues/queries";
import { useOrganizationsQuery } from "@/features/orgs/queries";
import { useUiStore } from "@/features/shared/ui-store";
import { getApiErrorDescription } from "@/lib/api/error";

export default function BoardPage() {
  const activeOrgId = useUiStore((state) => state.activeOrgId);
  const activeRepoId = useUiStore((state) => state.activeRepoId);
  const setActiveOrgId = useUiStore((state) => state.setActiveOrgId);

  const orgQuery = useOrganizationsQuery();

  useEffect(() => {
    if (!activeOrgId && orgQuery.data?.defaultOrgId) {
      setActiveOrgId(orgQuery.data.defaultOrgId);
    }
  }, [activeOrgId, orgQuery.data?.defaultOrgId, setActiveOrgId]);

  const query = useIssuesQuery({ orgId: activeOrgId ?? undefined, repoId: activeRepoId ?? undefined });

  if (query.isLoading) return <TableSkeleton rows={5} />;

  if (query.isError) {
    return (
      <ErrorState
        title="보드를 불러오지 못했습니다"
        description={getApiErrorDescription(query.error, "레포 선택 상태를 확인해 주세요.")}
      />
    );
  }

  const issues = query.data?.issues ?? [];

  if (!activeOrgId || !activeRepoId) {
    return <EmptyState title="조직/레포를 선택해 주세요" description="좌측 스위처에서 작업 범위를 선택하면 보드가 활성화됩니다." />;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Board</p>
        <h2 className="text-2xl font-bold">칸반 보드</h2>
        <p className="text-sm text-muted-foreground">카드를 드래그해 상태를 변경하세요.</p>
      </header>

      <KanbanBoard orgId={activeOrgId} repoId={activeRepoId} issues={issues} />
    </section>
  );
}
