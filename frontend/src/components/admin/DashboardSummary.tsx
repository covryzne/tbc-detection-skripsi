"use client";

import { SummaryCard } from "@/components/SummaryCard";
import {
  IconDeviceAnalytics,
  IconLungs,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";

interface SummaryCardData {
  title: string;
  value: string;
  description: string;
  iconType: string;
  trend: string;
  trendUp: boolean;
}

interface DashboardSummaryProps {
  summaryData: SummaryCardData[];
}

export const DashboardSummary = ({ summaryData }: DashboardSummaryProps) => {
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
      case "chart":
        return (props: any) => (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
            <IconChartBar {...props} className="h-6 w-6 text-blue-500" />
          </div>
        );
      case "users":
        return (props: any) => (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
            <IconUsers {...props} className="h-6 w-6 text-blue-500" />
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryData.map((card, index) => (
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
  );
};
