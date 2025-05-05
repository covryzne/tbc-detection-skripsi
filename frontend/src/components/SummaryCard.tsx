import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendUp: boolean;
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">{value}</div>{" "}
        {/* Ganti bold ke medium */}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div
          className={`text-xs mt-2 ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
