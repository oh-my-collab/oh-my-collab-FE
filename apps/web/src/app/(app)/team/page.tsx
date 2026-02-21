import { TeamMembersPanel } from "@/components/team/team-members-panel";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type TeamPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;
  const role = workspaceContext.role ?? "member";

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">팀</p>
        <h1 className="page-title">협업 역할 관리</h1>
        <p className="page-subtitle">
          팀원 역할과 참여 현황을 확인합니다. 오너는 이 화면에서 역할을 바로 조정할 수 있습니다.
        </p>
      </header>

      {!workspaceId ? (
        <p className="empty-note">
          조회 가능한 워크스페이스가 없습니다. 설정 화면에서 워크스페이스를 준비해 주세요.
        </p>
      ) : (
        <TeamMembersPanel workspaceId={workspaceId} currentRole={role} />
      )}
    </main>
  );
}
