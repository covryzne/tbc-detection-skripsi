"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "recharts";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Pie,
  Cell,
} from "recharts";

// Sample data for demonstration purposes
const performanceData = [
  { month: "Jan", accuracy: 0.92, precision: 0.89, recall: 0.85, f1: 0.87 },
  { month: "Feb", accuracy: 0.93, precision: 0.9, recall: 0.86, f1: 0.88 },
  { month: "Mar", accuracy: 0.94, precision: 0.91, recall: 0.87, f1: 0.89 },
  { month: "Apr", accuracy: 0.93, precision: 0.92, recall: 0.88, f1: 0.9 },
  { month: "May", accuracy: 0.95, precision: 0.93, recall: 0.89, f1: 0.91 },
  { month: "Jun", accuracy: 0.96, precision: 0.94, recall: 0.9, f1: 0.92 },
];

const confusionMatrixData = {
  truePositive: 152,
  falsePositive: 18,
  trueNegative: 142,
  falseNegative: 13,
};

const pieData = [
  {
    name: "True Positive",
    value: confusionMatrixData.truePositive,
    color: "#60a5fa",
  },
  {
    name: "False Positive",
    value: confusionMatrixData.falsePositive,
    color: "#f87171",
  },
  {
    name: "True Negative",
    value: confusionMatrixData.trueNegative,
    color: "#4ade80",
  },
  {
    name: "False Negative",
    value: confusionMatrixData.falseNegative,
    color: "#fbbf24",
  },
];

const COLORS = ["#60a5fa", "#f87171", "#4ade80", "#fbbf24"];

export default function MetricsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold mb-6">
                  Model Evaluation Metrics
                </h1>

                <Tabs defaultValue="performance" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="performance">
                      Model Performance
                    </TabsTrigger>
                    <TabsTrigger value="confusion">
                      Confusion Matrix
                    </TabsTrigger>
                    <TabsTrigger value="comparison">
                      Model Comparison
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="performance" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics Over Time</CardTitle>
                        <CardDescription>
                          Tracking accuracy, precision, recall and F1-score of
                          the TB detection model
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={performanceData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis domain={[0.8, 1]} />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#3b82f6"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="precision"
                                stroke="#10b981"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="recall"
                                stroke="#f59e0b"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="f1"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        title="Accuracy"
                        value="95.4%"
                        description="Overall classification accuracy"
                      />
                      <MetricCard
                        title="Precision"
                        value="89.4%"
                        description="True positives among predicted positives"
                      />
                      <MetricCard
                        title="Recall"
                        value="92.1%"
                        description="True positives detected among all actual positives"
                      />
                      <MetricCard
                        title="F1 Score"
                        value="90.7%"
                        description="Harmonic mean of precision and recall"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="confusion" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Confusion Matrix</CardTitle>
                          <CardDescription>
                            Distribution of model predictions vs. actual values
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-center">
                            <div className="grid grid-cols-2 border border-gray-200 divide-x divide-y divide-gray-200">
                              <div className="p-6 text-center bg-blue-100">
                                <div className="font-semibold text-lg mb-1">
                                  True Positive
                                </div>
                                <div className="text-3xl font-bold">
                                  {confusionMatrixData.truePositive}
                                </div>
                              </div>
                              <div className="p-6 text-center bg-red-100">
                                <div className="font-semibold text-lg mb-1">
                                  False Positive
                                </div>
                                <div className="text-3xl font-bold">
                                  {confusionMatrixData.falsePositive}
                                </div>
                              </div>
                              <div className="p-6 text-center bg-yellow-100">
                                <div className="font-semibold text-lg mb-1">
                                  False Negative
                                </div>
                                <div className="text-3xl font-bold">
                                  {confusionMatrixData.falseNegative}
                                </div>
                              </div>
                              <div className="p-6 text-center bg-green-100">
                                <div className="font-semibold text-lg mb-1">
                                  True Negative
                                </div>
                                <div className="text-3xl font-bold">
                                  {confusionMatrixData.trueNegative}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Distribution of Predictions</CardTitle>
                          <CardDescription>
                            Visualization of the confusion matrix
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="comparison" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Model Performance Comparison</CardTitle>
                        <CardDescription>
                          Comparing different machine learning models for TB
                          detection
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: "CNN",
                                  accuracy: 0.95,
                                  precision: 0.92,
                                  recall: 0.91,
                                  f1: 0.91,
                                },
                                {
                                  name: "ResNet",
                                  accuracy: 0.94,
                                  precision: 0.9,
                                  recall: 0.92,
                                  f1: 0.91,
                                },
                                {
                                  name: "VGG16",
                                  accuracy: 0.91,
                                  precision: 0.88,
                                  recall: 0.89,
                                  f1: 0.88,
                                },
                                {
                                  name: "DenseNet",
                                  accuracy: 0.93,
                                  precision: 0.91,
                                  recall: 0.9,
                                  f1: 0.9,
                                },
                              ]}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0.8, 1]} />
                              <Tooltip />
                              <Legend />
                              <Bar
                                dataKey="accuracy"
                                name="Accuracy"
                                fill="#3b82f6"
                              />
                              <Bar
                                dataKey="precision"
                                name="Precision"
                                fill="#10b981"
                              />
                              <Bar
                                dataKey="recall"
                                name="Recall"
                                fill="#f59e0b"
                              />
                              <Bar
                                dataKey="f1"
                                name="F1 Score"
                                fill="#8b5cf6"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Model Features</CardTitle>
                        <CardDescription>
                          Comparison of model characteristics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-200 p-2 text-left">
                                  Model
                                </th>
                                <th className="border border-gray-200 p-2 text-left">
                                  Architecture
                                </th>
                                <th className="border border-gray-200 p-2 text-left">
                                  Parameters
                                </th>
                                <th className="border border-gray-200 p-2 text-left">
                                  Inference Time
                                </th>
                                <th className="border border-gray-200 p-2 text-left">
                                  Accuracy
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-200 p-2">
                                  CNN
                                </td>
                                <td className="border border-gray-200 p-2">
                                  Custom 5-layer
                                </td>
                                <td className="border border-gray-200 p-2">
                                  2.3M
                                </td>
                                <td className="border border-gray-200 p-2">
                                  34ms
                                </td>
                                <td className="border border-gray-200 p-2">
                                  95.4%
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-200 p-2">
                                  ResNet
                                </td>
                                <td className="border border-gray-200 p-2">
                                  ResNet-50
                                </td>
                                <td className="border border-gray-200 p-2">
                                  25.6M
                                </td>
                                <td className="border border-gray-200 p-2">
                                  58ms
                                </td>
                                <td className="border border-gray-200 p-2">
                                  94.2%
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-200 p-2">
                                  VGG16
                                </td>
                                <td className="border border-gray-200 p-2">
                                  VGG-16
                                </td>
                                <td className="border border-gray-200 p-2">
                                  138M
                                </td>
                                <td className="border border-gray-200 p-2">
                                  112ms
                                </td>
                                <td className="border border-gray-200 p-2">
                                  91.0%
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-200 p-2">
                                  DenseNet
                                </td>
                                <td className="border border-gray-200 p-2">
                                  DenseNet-121
                                </td>
                                <td className="border border-gray-200 p-2">
                                  8.0M
                                </td>
                                <td className="border border-gray-200 p-2">
                                  45ms
                                </td>
                                <td className="border border-gray-200 p-2">
                                  93.2%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Helper component for metric cards
function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
