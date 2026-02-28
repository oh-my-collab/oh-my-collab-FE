"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mockClient } from "@/lib/api/mock-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => mockClient.getSettings(),
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => mockClient.updateSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
