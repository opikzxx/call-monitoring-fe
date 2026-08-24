import { Suspense } from "react";
import { CallMonitoringScreen } from "@/features/call-monitoring/components/call-monitoring-screen";

export default function DashboardPage() {
  return (
    <Suspense>
      <CallMonitoringScreen />
    </Suspense>
  );
}
