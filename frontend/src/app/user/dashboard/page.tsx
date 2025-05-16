"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { SummaryCard } from "@/components/SummaryCard";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { IconDeviceAnalytics, IconLungs } from "@tabler/icons-react";

interface SummaryCardData {
  title: string;
  value: string;
  description: string;
  iconType: string;
  trend: string;
  trendUp: boolean;
}

interface ActivityData {
  id?: string;
  userId?: string;
  user?: string;
  date: string;
  region?: string;
  result: string;
  confidence: string;
}

interface DashboardData {
  summaryCards: SummaryCardData[];
  recentActivity: ActivityData[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("/api/v1/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dashboard response:", response.data);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Gagal memuat data dashboard");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "analysis":
        return (props: any) => (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
            <IconDeviceAnalytics {...props} className="h-6 w-6 text-blue-500" />
          </div>
        );
      case "lungs":
        return (props: any) => (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
            <IconLungs {...props} className="h-6 w-6 text-blue-500" />
          </div>
        );
      default:
        return (props: any) => (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
            <IconDeviceAnalytics {...props} className="h-6 w-6 text-blue-500" />
          </div>
        );
    }
  };

  const handleShowAllActivity = () => {
    router.push("/user/history");
  };

  if (isLoading) {
    return <div className="text-center py-6">Memuat...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-6">Data tidak tersedia</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Selamat Datang, User!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {data.summaryCards.map((card, index) => (
                <SummaryCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  description={card.description}
                  icon={getIcon(card.iconType)}
                  trend={card.trend}
                  trendUp={card.trendUp}
                />
              ))}
            </div>
            <RecentActivity
              activityData={data.recentActivity}
              onShowAllClick={handleShowAllActivity}
              title="Aktivitas Terbaru Anda"
              description="Hasil deteksi TB terbaru Anda"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
