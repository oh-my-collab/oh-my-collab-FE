"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateIssueMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => mockClient.createIssue(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.org(orgId) });
    },
  });
}

export function useUpdateIssueMutation(orgId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Record<string, unknown>) => mockClient.updateIssue(issueId, patch),
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
      mockClient.reorderIssues({ orgId, repoId, buckets }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.repo(repoId) });
    },
  });
}
