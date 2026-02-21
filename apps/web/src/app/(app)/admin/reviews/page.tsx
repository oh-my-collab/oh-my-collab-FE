import { ReviewsManager } from "@/components/admin/reviews-manager";

import { requireAdminAccess } from "../admin-guard";

type AdminReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const { workspaceId } = await requireAdminAccess(searchParams);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          구성원 리뷰와 증거팩
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          자동 점수는 참고 지표로만 사용하고, 최종 평점은 관리자 수동 입력으로 확정합니다.
        </p>
      </header>

      <ReviewsManager workspaceId={workspaceId} />
    </main>
  );
}
