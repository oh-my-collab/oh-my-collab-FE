"use client";

import { useQuery } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useRequestsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.requests(orgId),
    queryFn: () => backendClient.listRequests(orgId),
    enabled: Boolean(orgId),
  });
}
