"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { backendClient } from "@/lib/api/backend-client";
import { queryKeys } from "@/lib/api/query-keys";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => backendClient.getSettings(),
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => backendClient.updateSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
