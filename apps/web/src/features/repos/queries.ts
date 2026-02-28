"use client";

import { useQuery } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useRepositoriesByOrgQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.reposByOrg(orgId),
    queryFn: () => backendClient.listReposByOrg(orgId),
    enabled: Boolean(orgId),
  });
}

export function useRepositoryQuery(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repo(repoId),
    queryFn: () => backendClient.getRepo(repoId),
    enabled: Boolean(repoId),
  });
}

export function useRepositoryActivityQuery(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repoActivity(repoId),
    queryFn: () => backendClient.getRepoActivity(repoId),
    enabled: Boolean(repoId),
  });
}
