"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: queryKeys.orgs,
    queryFn: () => backendClient.listOrgs(),
  });
}

export function useOrganizationQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.org(orgId),
    queryFn: () => backendClient.getOrg(orgId),
    enabled: Boolean(orgId),
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => backendClient.createOrg(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs });
    },
  });
}
