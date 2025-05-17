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
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Loading</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Data tidak tersedia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Welcome, Admin!</h1>
            <DashboardSummary summaryData={data.summaryCards} />
            <DashboardCharts
              detectionData={data.detectionData}
              regionalData={data.regionalData}
            />
            <RecentActivity
              activityData={data.recentActivity}
              onShowAllClick={onShowAllClick}
              title="Recent Detection Activity"
              description="Latest TB detection scans in the system"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
