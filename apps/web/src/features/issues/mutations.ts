"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateIssueMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => backendClient.createIssue(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.org(orgId) });
    },
  });
}

export function useUpdateIssueMutation(orgId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Record<string, unknown>) => backendClient.updateIssue(issueId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.issue(issueId) });
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.org(orgId) });
    },
  });
}

export function useReorderIssuesMutation(orgId: string, repoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (buckets: Record<string, unknown>) =>
      backendClient.reorderIssues({ orgId, repoId, buckets }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.repo(repoId) });
    },
  });
}
