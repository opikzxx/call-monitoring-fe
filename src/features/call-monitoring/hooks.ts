import { useQuery } from "@tanstack/react-query";
import { listCallMonitoring } from "@/features/call-monitoring/api";
import type { ListCallMonitoringParams } from "@/features/call-monitoring/schema";

export function callMonitoringQueryKey(params: ListCallMonitoringParams) {
  return ["call-monitoring", params] as const;
}

export function useCallMonitoring(params: ListCallMonitoringParams = {}) {
  return useQuery({
    queryKey: callMonitoringQueryKey(params),
    queryFn: () => listCallMonitoring(params),
    placeholderData: (previousData) => previousData,
  });
}
