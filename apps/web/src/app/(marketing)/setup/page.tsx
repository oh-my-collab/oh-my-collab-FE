import Link from "next/link";

const STEPS = [
  {
    title: "Fork template",
    description: "저장소를 복제하고 기본 프로젝트 구조를 준비합니다.",
  },
  {
    title: "Vercel Import",
    description: "배포 프로젝트를 연결하고 브랜치 빌드 설정을 구성합니다.",
  },
  {
    title: "Env setup",
    description: "Supabase와 인증 환경 변수를 설정합니다.",
  },
  {
    title: "DB migration",
    description: "기본 스키마와 평가/관리자 스키마를 순서대로 적용합니다.",
  },
  {
    title: "Workspace init",
    description: "초기 워크스페이스를 만들고 팀 운영 데이터를 입력합니다.",
  },
] as const;

const DELIVERY_QUEUE = [
  { title: "Onboarding docs check", status: "To Do", owner: "PM" },
  { title: "Infra env validate", status: "In Progress", owner: "Ops" },
  { title: "Workspace kickoff", status: "Ready", owner: "Lead" },
] as const;

const CHECKLIST = [
  "프로덕션 환경 변수 누락 없음",
  "RLS 정책 및 권한 정책 검증 완료",
  "샘플 데이터 시드 실행 완료",
] as const;

export default function SetupPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          15-Minute Team Setup
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          팀 협업 환경을 빠르게 시작하기 위한 초기 설정 순서입니다. 설정 완료 후 바로
          작업/문서/목표 운영을 시작할 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tasks"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open Tasks
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open Admin
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Setup Timeline</h2>
          <ol className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {STEPS.map((step, index) => (
              <li key={step.title} className="grid gap-2 py-3 md:grid-cols-[120px_1fr]">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
                  Step {index + 1}
                </p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Delivery Queue</h2>
          <ul className="mt-3 space-y-2">
            {DELIVERY_QUEUE.map((item) => (
              <li key={item.title} className="rounded border border-[var(--border)] bg-white px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.owner}</p>
                <span className="mt-2 inline-flex rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Pre-flight Check</h2>
        <ul className="mt-3 space-y-2">
          {CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 border-l-2 border-blue-500 pl-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
