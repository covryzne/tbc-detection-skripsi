"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SummaryCard } from "@/components/SummaryCard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart, BarChart } from "recharts";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
} from "recharts";
import {
  IconLungs,
  IconUsers,
  IconChartBar,
  IconDeviceAnalytics,
} from "@tabler/icons-react";

// Sample data for demonstration purposes
const detectionData = [
  { month: "Jan", detections: 45, positives: 12 },
  { month: "Feb", detections: 52, positives: 15 },
  { month: "Mar", detections: 61, positives: 18 },
  { month: "Apr", detections: 67, positives: 22 },
  { month: "May", detections: 75, positives: 25 },
  { month: "Jun", detections: 80, positives: 27 },
];

const regionalData = [
  { region: "Jakarta", detections: 145, positives: 42 },
  { region: "Bandung", detections: 112, positives: 38 },
  { region: "Surabaya", detections: 95, positives: 35 },
  { region: "Medan", detections: 78, positives: 26 },
  { region: "Makassar", detections: 65, positives: 22 },
  { region: "Yogyakarta", detections: 88, positives: 30 },
  { region: "Semarang", detections: 72, positives: 25 },
  { region: "Palembang", detections: 60, positives: 20 },
  { region: "Denpasar", detections: 50, positives: 18 },
  { region: "Balikpapan", detections: 40, positives: 15 },
];

const recentActivity = [
  {
    userId: "U001",
    user: "Ahmad Fauzi",
    date: "May 5, 2025 09:25",
    region: "Jakarta",
    result: "Positive",
    confidence: "97.8%",
  },
  {
    userId: "U002",
    user: "Budi Santoso",
    date: "May 5, 2025 08:42",
    region: "Bandung",
    result: "Negative",
    confidence: "95.2%",
  },
  {
    userId: "U003",
    user: "Siti Rahayu",
    date: "May 4, 2025 16:12",
    region: "Surabaya",
    result: "Positive",
    confidence: "94.5%",
  },
  {
    userId: "U004",
    user: "Dewi Lestari",
    date: "May 4, 2025 14:30",
    region: "Medan",
    result: "Negative",
    confidence: "98.1%",
  },
  {
    userId: "U005",
    user: "Hendra Wijaya",
    date: "May 4, 2025 11:18",
    region: "Makassar",
    result: "Negative",
    confidence: "96.3%",
  },
  {
    userId: "U006",
    user: "Rina Andriani",
    date: "May 3, 2025 10:45",
    region: "Yogyakarta",
    result: "Positive",
    confidence: "93.7%",
  },
  {
    userId: "U007",
    user: "Teguh Prasetyo",
    date: "May 3, 2025 09:30",
    region: "Semarang",
    result: "Negative",
    confidence: "94.8%",
  },
  {
    userId: "U008",
    user: "Lina Kusuma",
    date: "May 2, 2025 15:20",
    region: "Palembang",
    result: "Positive",
    confidence: "92.5%",
  },
  {
    userId: "U009",
    user: "Andi Saputra",
    date: "May 2, 2025 13:10",
    region: "Denpasar",
    result: "Negative",
    confidence: "97.2%",
  },
  {
    userId: "U010",
    user: "Fajar Hidayat",
    date: "May 2, 2025 11:00",
    region: "Balikpapan",
    result: "Positive",
    confidence: "91.6%",
  },
];

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold mb-6">Welcome Admin!</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <SummaryCard
                    title="Total Detections"
                    value="1,245"
                    description="All-time TB detection scans"
                    icon={(props) => (
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <IconDeviceAnalytics
                          {...props}
                          className="h-6 w-6 text-blue-500"
                        />
                      </div>
                    )}
                    trend="+12% from last month"
                    trendUp={true}
                  />
                  <SummaryCard
                    title="Positive Cases"
                    value="327"
                    description="Detected TB positive cases"
                    icon={(props) => (
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <IconLungs
                          {...props}
                          className="h-6 w-6 text-blue-500"
                        />
                      </div>
                    )}
                    trend="+8% from last month"
                    trendUp={true}
                  />
                  <SummaryCard
                    title="Model Accuracy"
                    value="95.4%"
                    description="Overall detection accuracy"
                    icon={(props) => (
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <IconChartBar
                          {...props}
                          className="h-6 w-6 text-blue-500"
                        />
                      </div>
                    )}
                    trend="+1.2% from last version"
                    trendUp={true}
                  />
                  <SummaryCard
                    title="Active Users"
                    value="842"
                    description="Users utilizing TB detection"
                    icon={(props) => (
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <IconUsers
                          {...props}
                          className="h-6 w-6 text-blue-500"
                        />
                      </div>
                    )}
                    trend="+24% from last month"
                    trendUp={true}
                  />
                </div>

                {/* Main Charts */}
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

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent TB Detection Activity</CardTitle>
                    <CardDescription>
                      Latest TB detection scans performed in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              User ID
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              User
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Date & Time
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Region
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Detection Result
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Confidence
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.slice(0, 6).map((activity, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {activity.userId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {activity.user}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {activity.date}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {activity.region}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`inline-block px-2 py-1 rounded ${
                                    activity.result === "Positive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {activity.result}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {activity.confidence}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-right">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            // Navigate to detection history page
                            window.location.href = "/admin/riwayat";
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Show All Activity
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
