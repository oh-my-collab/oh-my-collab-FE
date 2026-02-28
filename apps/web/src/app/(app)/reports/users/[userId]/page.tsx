"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { InsightPanel } from "@/components/reports/insight-panel";
import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrganizationsQuery } from "@/features/orgs/queries";
import { useUserReportQuery } from "@/features/reports/queries";
import { useUiStore } from "@/features/shared/ui-store";
import { getApiErrorDescription } from "@/lib/api/error";

export default function UserReportPage() {
  const params = useParams<{ userId: string }>();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const activeOrgId = useUiStore((state) => state.activeOrgId);
  const setActiveOrgId = useUiStore((state) => state.setActiveOrgId);

  const orgQuery = useOrganizationsQuery();

  useEffect(() => {
    if (!activeOrgId && orgQuery.data?.defaultOrgId) {
      setActiveOrgId(orgQuery.data.defaultOrgId);
    }
  }, [activeOrgId, orgQuery.data?.defaultOrgId, setActiveOrgId]);

  const reportQuery = useUserReportQuery(activeOrgId ?? "", params.userId, period);

  if (orgQuery.isLoading || reportQuery.isLoading) {
    return <TableSkeleton rows={4} />;
  }

  if (orgQuery.isError || reportQuery.isError || !reportQuery.data?.report) {
    const sourceError = orgQuery.error ?? reportQuery.error;
    return (
      <ErrorState
        title="유저 리포트를 불러오지 못했습니다"
        description={getApiErrorDescription(sourceError, "조직 또는 유저를 확인해 주세요.")}
      />
    );
  }

  const report = reportQuery.data.report;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">User Drill-down</p>
        <h2 className="text-2xl font-bold">{report.userName} 리포트</h2>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${period === "week" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setPeriod("week")}
        >
          이번 주
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${period === "month" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setPeriod("month")}
        >
          이번 달
        </button>
      </div>

      <ReportKpiCards
        totalTasks={report.taskCount}
        completedTasks={report.completedTaskCount}
        avgDifficulty={report.avgDifficulty}
      />

      <Card>
        <CardHeader>
          <CardTitle>레포별 기여</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.byRepo.map((item) => (
            <div key={item.repoId} className="flex items-center justify-between rounded-md border border-border p-2">
              <div>
                <p className="text-sm font-semibold">{item.repoName}</p>
                <p className="text-xs text-muted-foreground">작업 {item.taskCount}건</p>
              </div>
              <Badge variant={item.difficultyAvg >= 70 ? "warn" : "secondary"}>
                난이도 {item.difficultyAvg}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 이슈</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.recentIssues.map((issue) => (
            <div key={issue.id} className="rounded-md border border-border p-2">
              <p className="text-sm font-semibold">{issue.id} · {issue.title}</p>
              <p className="text-xs text-muted-foreground">{issue.status} · {issue.priority}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <InsightPanel evidence={report.evidence} risks={report.risks} nextActions={report.nextActions} />
    </section>
  );
}
