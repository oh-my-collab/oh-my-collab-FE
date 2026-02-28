import Link from "next/link";

import type { Organization } from "@/features/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OrganizationCard({
  organization,
  summary,
}: {
  organization: Organization;
  summary?: {
    repositoryCount: number;
    openIssueCount: number;
    weeklyCommits: number;
    weeklyMerges: number;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{organization.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{organization.slug}</p>
        {summary ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">레포 수</p>
              <p className="font-semibold">{summary.repositoryCount}</p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">오픈 이슈</p>
              <p className="font-semibold">{summary.openIssueCount}</p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">주간 커밋</p>
              <p className="font-semibold">{summary.weeklyCommits}</p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">주간 머지</p>
              <p className="font-semibold">{summary.weeklyMerges}</p>
            </div>
          </div>
        ) : null}
        <Button asChild className="w-full">
          <Link href={`/orgs/${organization.id}`}>조직 대시보드</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
