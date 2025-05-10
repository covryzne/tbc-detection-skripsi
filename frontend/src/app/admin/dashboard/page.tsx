// app/admin/dashboard/page.tsx
"use client";

import {
  DashboardDataProvider,
  useDashboardData,
} from "@/components/admin/DashboardDataProvider";
import { DashboardSummary } from "@/components/admin/DashboardSummary";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <DashboardDataProvider>
      <DashboardContent onShowAllClick={() => router.push("/admin/history")} />
    </DashboardDataProvider>
  );
}

function DashboardContent({ onShowAllClick }: { onShowAllClick: () => void }) {
  const dashboardData = useDashboardData();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Welcome Admin!</h1>
            <DashboardSummary summaryData={dashboardData.summaryCards} />
            <DashboardCharts
              detectionData={dashboardData.detectionData}
              regionalData={dashboardData.regionalData}
            />
            <RecentActivity
              activityData={dashboardData.recentActivity}
              onShowAllClick={onShowAllClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
