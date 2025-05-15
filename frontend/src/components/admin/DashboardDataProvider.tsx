"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import axios from "@/lib/axios";

// Define types for our data
export interface SummaryCardData {
  title: string;
  value: string;
  description: string;
  iconType: string;
  trend: string;
  trendUp: boolean;
}

export interface DetectionData {
  month: string;
  detections: number;
  positives: number;
}

export interface RegionalData {
  region: string;
  detections: number;
  positives: number;
}

export interface ActivityData {
  userId: string;
  user: string;
  date: string;
  region: string;
  result: string;
  confidence: string;
}

export interface DashboardData {
  summaryCards: SummaryCardData[];
  detectionData: DetectionData[];
  regionalData: RegionalData[];
  recentActivity: ActivityData[];
}

// Create context
const DashboardDataContext = createContext<
  | {
      data: DashboardData | null;
      loading: boolean;
      error: string | null;
    }
  | undefined
>(undefined);

// Provider component
export const DashboardDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No auth token found. Please login again.");
        }

        const response = await axios.get("/api/v1/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(response.data);
        setLoading(false);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Failed to fetch dashboard data";
        setError(errorMsg);
        setLoading(false);
        console.error("Fetch error:", err.response?.data || err);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardDataContext.Provider value={{ data, loading, error }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

// Custom hook to use the dashboard data
export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardData must be used within a UDashboardDataProvider"
    );
  }
  return context;
};
