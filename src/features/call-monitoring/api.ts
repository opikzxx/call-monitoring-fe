import { apiClient } from "@/lib/api/client";
import { callMonitoringPageSchema } from "@/features/call-monitoring/schema";
import type { ListCallMonitoringParams } from "@/features/call-monitoring/schema";

export async function listCallMonitoring(
  params: ListCallMonitoringParams = {}
) {
  const response = await apiClient.get("/api/call-monitoring", { params });
  return callMonitoringPageSchema.parse(response.data);
}
