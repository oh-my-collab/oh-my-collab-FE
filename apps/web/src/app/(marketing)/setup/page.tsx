import Link from "next/link";

const STEPS = [
  {
    title: "Fork template",
    description:
      "팀 전용 저장소를 만든 뒤 README와 .env.example 파일을 먼저 검토합니다.",
  },
  {
    title: "Vercel Import",
    description:
      "새 프로젝트를 Import하고 빌드 명령어, 루트 디렉터리, 브랜치 연결을 확인합니다.",
  },
  {
    title: "Env setup",
    description:
      "Supabase URL/Anon Key/Service Key를 채워 배포 환경과 로컬 환경을 동일하게 맞춥니다.",
  },
  {
    title: "DB migration",
    description:
      "초기 스키마와 인사이트 SQL 마이그레이션을 순서대로 적용해 데이터 구조를 준비합니다.",
  },
  {
    title: "Workspace init",
    description:
      "워크스페이스를 생성하고 기본 문서, 태스크, 목표를 넣어 첫 주 운영을 시작합니다.",
  },
] as const;

const CHECKLIST = [
  "프로덕션 환경 변수 누락 없음",
  "RLS 정책 적용 확인",
  "샘플 데이터 시드 실행 완료",
] as const;

export default function SetupPage() {
  return (
    <main className="space-y-5">
      <header className="surface-card-muted px-6 py-8 md:px-8">
        <p className="page-kicker">Onboarding</p>
        <h1 className="page-title">15-Minute Team Setup</h1>
        <p className="page-subtitle">
          Follow this checklist to launch your own no-subscription collaboration
          workspace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tasks" className="btn-primary">
            Open Workspace
          </Link>
          <Link href="/docs" className="btn-secondary">
            View Templates
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {STEPS.map((step, index) => (
          <article key={step.title} className="surface-card p-5">
            <span className="chip">STEP {index + 1}</span>
            <h2 className="section-title mt-3">{step.title}</h2>
            <p className="muted-copy mt-2 text-sm">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="surface-card p-5 md:p-6">
        <h2 className="section-title">Pre-flight Check</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2 text-slate-700">
              <span className="chip mt-0.5">OK</span>
              <span className="muted-copy">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
