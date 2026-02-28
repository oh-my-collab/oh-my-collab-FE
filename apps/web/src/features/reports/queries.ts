"use client";

import { useQuery } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useTeamReportQuery(orgId: string, period: "week" | "month") {
  return useQuery({
    queryKey: queryKeys.reportsSummary(orgId, period),
    queryFn: () => mockClient.getTeamReport(orgId, period),
    enabled: Boolean(orgId),
  });
}

export function useUserReportQuery(
  orgId: string,
  userId: string,
  period: "week" | "month"
) {
  return useQuery({
    queryKey: queryKeys.reportUser(orgId, userId, period),
    queryFn: () => mockClient.getUserReport(orgId, userId, period),
    enabled: Boolean(orgId && userId),
  });
}
