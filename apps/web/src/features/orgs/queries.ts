"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: queryKeys.orgs,
    queryFn: () => mockClient.listOrgs(),
  });
}

export function useOrganizationQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.org(orgId),
    queryFn: () => mockClient.getOrg(orgId),
    enabled: Boolean(orgId),
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => mockClient.createOrg(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs });
    },
  });
}
