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
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          관리자 권한 관리
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          owner가 멤버를 admin으로 지정하거나 해제할 수 있습니다.
        </p>
      </header>

      <MembersManager workspaceId={workspaceId} currentRole={role} />
    </main>
  );
}
