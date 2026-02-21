import { ROLE_COPY } from "@/lib/ui/copy";

type SettingsPanelProps = {
  workspaceId: string;
  role: "owner" | "admin";
};

export function SettingsPanel({ workspaceId, role }: SettingsPanelProps) {
  const roleLabel = ROLE_COPY[role];

  return (
    <div className="space-y-8">
      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">보존 정책</h2>
          <span className="chip">기본 12개월</span>
        </div>
        <p className="muted-copy text-sm">
          기본 보존 기간은 12개월입니다. 기간이 지난 데이터는 아카이브 후 삭제할 수 있으며,
          운영 정책 변경 전에는 팀 공지를 권장합니다.
        </p>
        <div className="mt-3 rounded-xl border border-[var(--line-default)] bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--ink-default)]">
          <p>
            현재 워크스페이스: <strong>{workspaceId}</strong>
          </p>
          <p className="mt-1">
            현재 권한: <strong>{roleLabel}</strong>
          </p>
          <p className="mt-1">
            보존 기간: <strong>12개월</strong>
          </p>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">관리자 설정 방법</h2>
        </div>
        <ol className="space-y-2 text-sm text-[var(--ink-default)]">
          <li>1. 오너 계정으로 `관리 → 관리자 권한` 페이지로 이동합니다.</li>
          <li>2. 대상 사용자의 역할을 `관리자`로 변경하고 저장합니다.</li>
          <li>3. 변경 이력은 감사 로그(`admin_audit_logs`)에 기록됩니다.</li>
        </ol>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">운영 문서</h2>
        </div>
        <ul className="space-y-2 text-sm text-[var(--ink-default)]">
          <li>
            관리자 설정 가이드: <code>docs/admin/admin-setup.md</code>
          </li>
          <li>
            평가 정책 문서: <code>docs/admin/evaluation-policy.md</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
