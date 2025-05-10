"use client";

import { createContext, useContext, ReactNode } from "react";
import dashboardData from "@/app/admin/dummy/dashboard-data.json";

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
  user: any;
  summaryCards: SummaryCardData[];
  detectionData: DetectionData[];
  regionalData: RegionalData[];
  recentActivity: ActivityData[];
}

// Create context
const DashboardDataContext = createContext<DashboardData | undefined>(
  undefined
);

// Provider component
export const DashboardDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <DashboardDataContext.Provider value={dashboardData as DashboardData}>
      {children}
    </DashboardDataContext.Provider>
  );
};

// Custom hook to use the dashboard data
export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardData must be used within a DashboardDataProvider"
    );
  }
  return context;
};
