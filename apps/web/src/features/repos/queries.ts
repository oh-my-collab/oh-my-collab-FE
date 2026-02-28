"use client";

import { useQuery } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useRepositoriesByOrgQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.reposByOrg(orgId),
    queryFn: () => mockClient.listReposByOrg(orgId),
    enabled: Boolean(orgId),
  });
}

export function useRepositoryQuery(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repo(repoId),
    queryFn: () => mockClient.getRepo(repoId),
    enabled: Boolean(repoId),
  });
}

export function useRepositoryActivityQuery(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repoActivity(repoId),
    queryFn: () => mockClient.getRepoActivity(repoId),
    enabled: Boolean(repoId),
  });
}
