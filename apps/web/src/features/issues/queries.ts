"use client";

import { useQuery } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function serializeIssueFilters(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
}

export function useIssuesQuery(filters: Record<string, string | undefined>) {
  const params = serializeIssueFilters(filters);
  const key = params.toString();
  return useQuery({
    queryKey: queryKeys.issues(key),
    queryFn: () => backendClient.listIssues(params),
    enabled: Boolean(filters.orgId),
  });
}

export function useIssueQuery(issueId: string) {
  return useQuery({
    queryKey: queryKeys.issue(issueId),
    queryFn: () => backendClient.getIssue(issueId),
    enabled: Boolean(issueId),
  });
}
