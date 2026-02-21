type SettingsPanelProps = {
  workspaceId: string;
  role: "owner" | "admin";
};

export function SettingsPanel({ workspaceId, role }: SettingsPanelProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-[var(--border)] pb-6">
        <h2 className="text-lg font-semibold text-slate-900">보존 정책</h2>
        <p className="text-sm text-slate-600">
          기본 보존 기간은 12개월입니다. 기간이 지난 데이터는 아카이브 후 삭제할 수 있으며,
          운영 정책 변경 전에는 팀 공지를 권장합니다.
        </p>
        <div className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-700">
          <p>
            현재 워크스페이스: <strong>{workspaceId}</strong>
          </p>
          <p className="mt-1">
            현재 권한: <strong>{role}</strong>
          </p>
          <p className="mt-1">
            보존 기간: <strong>12개월</strong>
          </p>
        </div>
      </section>

      <section className="space-y-3 border-b border-[var(--border)] pb-6">
        <h2 className="text-lg font-semibold text-slate-900">관리자 설정 방법</h2>
        <ol className="space-y-2 text-sm text-slate-700">
          <li>1. owner 계정으로 `Admin → 관리자 권한` 페이지로 이동합니다.</li>
          <li>2. 대상 사용자의 역할을 `admin`으로 변경하고 저장합니다.</li>
          <li>3. 변경 이력은 감사 로그(`admin_audit_logs`)에 기록됩니다.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">운영 문서</h2>
        <ul className="space-y-2 text-sm text-slate-700">
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
