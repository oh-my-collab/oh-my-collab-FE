import { SettingsPanel } from "@/components/admin/settings-panel";

import { requireAdminAccess } from "../admin-guard";

type AdminSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const { workspaceId, role } = await requireAdminAccess(searchParams);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">관리</p>
        <h1 className="page-title">운영 설정</h1>
        <p className="page-subtitle">
          보존 정책, 내보내기 운영 기준, 관리자 권한 운영 절차를 확인합니다.
        </p>
      </header>

      <SettingsPanel workspaceId={workspaceId} role={role} />
    </main>
  );
}
