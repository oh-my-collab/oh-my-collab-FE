import Link from "next/link";

import { ROLE_COPY } from "@/lib/ui/copy";
import { requireAdminAccess } from "./admin-guard";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { workspaceId, role } = await requireAdminAccess(searchParams);
  const query = new URLSearchParams({ workspaceId }).toString();
  const roleLabel = ROLE_COPY[role];

  const links = [
    {
      href: `/admin/cycles?${query}`,
      title: "평가 주기와 가중치",
      description: "주기 생성, 상태 변경, 가중치(총합 100) 관리",
    },
    {
      href: `/admin/members?${query}`,
      title: "관리자 권한",
      description: "오너가 관리자 지정/해제",
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
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">관리</p>
        <h1 className="page-title">관리자 콘솔</h1>
        <p className="page-subtitle">
          워크스페이스 <strong>{workspaceId}</strong> / 내 권한 <strong>{roleLabel}</strong>
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-raised)] px-4 py-4 transition hover:border-[var(--primary-400)] hover:bg-[var(--surface-soft)]"
          >
            <p className="text-base font-semibold text-[var(--ink-strong)]">{item.title}</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
