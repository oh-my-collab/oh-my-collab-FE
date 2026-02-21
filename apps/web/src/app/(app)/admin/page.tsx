import Link from "next/link";

import { requireAdminAccess } from "./admin-guard";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { workspaceId, role } = await requireAdminAccess(searchParams);
  const query = new URLSearchParams({ workspaceId }).toString();

  const links = [
    {
      href: `/admin/cycles?${query}`,
      title: "평가 주기와 가중치",
      description: "주기 생성, 상태 변경, 가중치(총합 100) 관리",
    },
    {
      href: `/admin/members?${query}`,
      title: "관리자 권한",
      description: "owner가 admin 지정/해제",
    },
    {
      href: `/admin/reviews?${query}`,
      title: "증거팩과 리뷰",
      description: "구성원별 참고 지표, 관리자 메모, 최종평점 수동 확정",
    },
    {
      href: `/admin/settings?${query}`,
      title: "운영 설정",
      description: "보존 정책(12개월), 내보내기, 운영 가이드",
    },
  ] as const;

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          관리자 콘솔
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          워크스페이스 <strong>{workspaceId}</strong> / 내 권한 <strong>{role}</strong>
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 hover:border-blue-300 hover:bg-blue-50/40"
          >
            <p className="text-base font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
