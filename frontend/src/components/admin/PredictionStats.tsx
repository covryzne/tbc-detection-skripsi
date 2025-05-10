import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconChartLine,
  IconLungs,
} from "@tabler/icons-react";

interface StatisticsProps {
  totalPredictions: number;
  positiveResults: number;
  negativeResults: number;
  averageConfidence: number;
  title?: string;
  description?: string;
}

export function PredictionStats({
  totalPredictions,
  positiveResults,
  negativeResults,
  averageConfidence,
  title = "TB Detection Statistics",
  description = "Overview of detection results",
}: StatisticsProps) {
  const calculatePercentage = (value: number) => {
    if (totalPredictions === 0) return 0;
    return Math.round((value / totalPredictions) * 100);
  };

  const stats = [
    {
      title: "Total Analyses",
      value: totalPredictions,
      icon: <IconChartLine className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-50 text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      title: "Positive Results",
      value: positiveResults,
      percentage: calculatePercentage(positiveResults),
      icon: <IconAlertCircle className="h-5 w-5 text-red-600" />,
      color: "bg-red-50 text-red-700",
      iconBg: "bg-red-100",
    },
    {
      title: "Negative Results",
      value: negativeResults,
      percentage: calculatePercentage(negativeResults),
      icon: <IconCircleCheck className="h-5 w-5 text-green-600" />,
      color: "bg-green-50 text-green-700",
      iconBg: "bg-green-100",
    },
    {
      title: "Avg. Confidence",
      value: `${averageConfidence.toFixed(1)}%`,
      icon: <IconLungs className="h-5 w-5 text-indigo-600" />,
      color: "bg-indigo-50 text-indigo-700",
      iconBg: "bg-indigo-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} p-4 rounded-lg flex flex-col items-center justify-center text-center`}
            >
              <div className={`${stat.iconBg} p-2 rounded-full mb-2`}>
                {stat.icon}
              </div>
              <div className="font-bold text-xl">{stat.value}</div>
              <div className="text-sm">{stat.title}</div>
              {stat.percentage !== undefined && (
                <div className="text-xs mt-1">({stat.percentage}%)</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
