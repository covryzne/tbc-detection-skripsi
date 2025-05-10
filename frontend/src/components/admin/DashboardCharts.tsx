"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
} from "recharts";

interface DetectionData {
  month: string;
  detections: number;
  positives: number;
}

interface RegionalData {
  region: string;
  detections: number;
  positives: number;
}

interface DashboardChartsProps {
  detectionData: DetectionData[];
  regionalData: RegionalData[];
}

export const DashboardCharts = ({
  detectionData,
  regionalData,
}: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>TB Detection Trend</CardTitle>
          <CardDescription>
            Monthly trend of TB detections and positive cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={detectionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="detections"
                  name="Total Scans"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="positives"
                  name="Positive Cases"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
          <CardDescription>
            TB detections and positive cases by region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="detections"
                  name="Total Scans"
                  fill="#3b82f6"
                  radius={6}
                />
                <Bar
                  dataKey="positives"
                  name="Positive Cases"
                  fill="#ef4444"
                  radius={6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
