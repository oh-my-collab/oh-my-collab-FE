"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateRequestMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => mockClient.createRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests(orgId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useUpdateRequestMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, input }: { requestId: string; input: Record<string, unknown> }) =>
      mockClient.updateRequest(requestId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests(orgId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
