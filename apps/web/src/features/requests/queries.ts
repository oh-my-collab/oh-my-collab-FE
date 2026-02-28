"use client";

import { useQuery } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useRequestsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.requests(orgId),
    queryFn: () => mockClient.listRequests(orgId),
    enabled: Boolean(orgId),
  });
}
