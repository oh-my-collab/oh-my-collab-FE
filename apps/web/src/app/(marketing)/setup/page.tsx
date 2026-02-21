import Link from "next/link";
import { WorkspaceConnectionPanel } from "@/components/setup/workspace-connection-panel";

const STEPS = [
  {
    title: "저장소 복제 및 기본 브랜치 준비",
    description: "프로젝트 저장소를 복제하고 팀 작업 브랜치 규칙을 설정합니다.",
  },
  {
    title: "Vercel 프로젝트 연결",
    description: "배포 환경과 프리뷰 브랜치를 연결해 리뷰 플로우를 준비합니다.",
  },
  {
    title: "환경 변수 및 인증 설정",
    description: "Supabase URL/키와 인증 쿠키 정책을 점검합니다.",
  },
  {
    title: "데이터베이스 마이그레이션 적용",
    description: "기본 협업 스키마와 관리자 평가 스키마를 순서대로 적용합니다.",
  },
  {
    title: "워크스페이스 초기화 및 샘플 데이터 점검",
    description: "초기 팀/문서/작업 데이터를 입력해 운영 준비를 완료합니다.",
  },
] as const;

const DELIVERY_QUEUE = [
  { title: "온보딩 문서 검수", status: "대기", owner: "PM" },
  { title: "운영 환경 변수 검증", status: "진행", owner: "운영" },
  { title: "워크스페이스 킥오프", status: "준비 완료", owner: "리드" },
] as const;

const CHECKLIST = [
  "프로덕션 환경 변수 누락 없음",
  "권한 정책 및 RLS 검증 완료",
  "샘플 데이터 시드 실행 완료",
] as const;

export default function SetupPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">온보딩</p>
        <h1 className="page-title">15분 팀 초기 설정</h1>
        <p className="page-subtitle">
          협업 운영을 빠르게 시작하기 위한 표준 초기화 순서입니다. 설정 완료 후 작업,
          문서, 목표, 관리자 평가 참고 화면을 바로 사용할 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tasks" className="btn-primary">
            작업 화면 열기
          </Link>
          <Link href="/admin" className="btn-secondary">
            관리자 화면 열기
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <div className="section-shell">
          <div className="section-head">
            <h2 className="section-title">초기 설정 타임라인</h2>
            <span className="chip">5단계</span>
          </div>
          <ol className="space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
                  단계 {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink-strong)]">{step.title}</p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="section-shell">
            <div className="section-head">
              <h2 className="section-title">준비 큐</h2>
              <span className="chip">운영 상태</span>
            </div>
            <ul className="space-y-2">
              {DELIVERY_QUEUE.map((item) => (
                <li key={item.title} className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-raised)] px-3 py-2.5">
                  <p className="text-sm font-semibold text-[var(--ink-strong)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-subtle)]">{item.owner}</p>
                  <span className="status-chip mt-2">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <WorkspaceConnectionPanel />
        </div>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">사전 점검 체크리스트</h2>
          <span className="chip">필수</span>
        </div>
        <ul className="space-y-2">
          {CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]"
            >
              <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-[var(--primary-600)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
