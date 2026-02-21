import { MembersManager } from "@/components/admin/members-manager";

import { requireAdminAccess } from "../admin-guard";

type AdminMembersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const { workspaceId, role } = await requireAdminAccess(searchParams);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">관리</p>
        <h1 className="page-title">관리자 권한 관리</h1>
        <p className="page-subtitle">오너가 멤버를 관리자로 지정하거나 해제할 수 있습니다.</p>
      </header>

      <MembersManager workspaceId={workspaceId} currentRole={role} />
    </main>
  );
}
