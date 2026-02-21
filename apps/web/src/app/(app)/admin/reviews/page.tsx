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
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">관리</p>
        <h1 className="page-title">구성원 리뷰와 증거팩</h1>
        <p className="page-subtitle">
          자동 점수는 참고 지표로만 사용하고, 최종 평점은 관리자 수동 입력으로 확정합니다.
        </p>
      </header>

      <ReviewsManager workspaceId={workspaceId} />
    </main>
  );
}
