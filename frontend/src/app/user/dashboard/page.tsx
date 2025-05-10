// app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { RecentPredictions } from "@/components/admin/RecentPredictions";

interface Prediction {
  id: string;
  patientName: string;
  date: string;
  status: "positive" | "negative";
  confidence: number;
}

interface UserStats {
  totalPredictions: number;
  lastPrediction: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalPredictions: 0,
    lastPrediction: "",
  });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch statistik user
        const statsRes = await axios.get("/api/v1/users/me/predictions/stats");
        setStats(statsRes.data);

        // Fetch prediksi user
        const predRes = await axios.get("/api/v1/users/me/predictions");
        setPredictions(predRes.data);
      } catch (err: any) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowAllActivity = () => {
    router.push("/user/history");
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Welcome User!</h1>
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Your Stats</h2>
              <p>Total Predictions: {stats.totalPredictions}</p>
              <p>Last Prediction: {stats.lastPrediction || "None"}</p>
            </div>
            <RecentPredictions
              predictions={predictions}
              onShowAllClick={handleShowAllActivity}
              title="Your Recent Predictions"
              description="Your latest TB detection results"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
