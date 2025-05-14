"use client";

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
import { ChevronRight } from "lucide-react";

// Sample data for performance metrics (AUC-ROC removed from BarChart)
const performanceData = [
  { name: "Accuracy", value: 0.97 },
  { name: "Precision", value: 0.97 },
  { name: "Recall", value: 0.97 },
  { name: "F1 Score", value: 0.97 },
];

// Adjusted ROC Curve data (based on your image, AUC ~0.966)
const rocData = [
  { fpr: 0.0, tpr: 0.0 },
  { fpr: 0.01, tpr: 0.45 },
  { fpr: 0.02, tpr: 0.7 },
  { fpr: 0.03, tpr: 0.82 },
  { fpr: 0.05, tpr: 0.88 },
  { fpr: 0.08, tpr: 0.92 },
  { fpr: 0.1, tpr: 0.94 },
  { fpr: 0.15, tpr: 0.96 },
  { fpr: 0.2, tpr: 0.97 },
  { fpr: 0.3, tpr: 0.98 },
  { fpr: 0.5, tpr: 0.99 },
  { fpr: 0.7, tpr: 0.995 },
  { fpr: 1.0, tpr: 1.0 },
];

// Baseline for ROC Curve (diagonal line, AUC=0.5)
const baselineData = [
  { fpr: 0.0, tpr: 0.0 },
  { fpr: 1.0, tpr: 1.0 },
];

// AUC value from your image
const aucValue = 0.96605779220599;

// Confusion Matrix data
const confusionMatrixData = {
  truePositive: 476,
  falsePositive: 4,
  trueNegative: 451,
  falseNegative: 28,
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

// DenseNet architecture layers
const densenetLayers = [
  {
    name: "Input",
    size: "224×224×3",
    color: "bg-gray-100",
    desc: "RGB image input",
  },
  {
    name: "Convolution",
    size: "112×112×64",
    color: "bg-blue-100",
    desc: "7×7 conv, stride 2",
  },
  {
    name: "Pooling",
    size: "56×56×64",
    color: "bg-purple-100",
    desc: "3×3 max pool, stride 2",
  },
  {
    name: "Dense Block 1",
    size: "56×56×256",
    color: "bg-green-100",
    desc: "6 dense layers",
  },
  {
    name: "Transition Layer 1",
    size: "28×28×128",
    color: "bg-yellow-100",
    desc: "1×1 conv + 2×2 avg pool",
  },
  {
    name: "Dense Block 2",
    size: "28×28×512",
    color: "bg-green-100",
    desc: "12 dense layers",
  },
  {
    name: "Transition Layer 2",
    size: "14×14×256",
    color: "bg-yellow-100",
    desc: "1×1 conv + 2×2 avg pool",
  },
  {
    name: "Dense Block 3",
    size: "14×14×1024",
    color: "bg-green-100",
    desc: "24 dense layers",
  },
  {
    name: "Transition Layer 3",
    size: "7×7×512",
    color: "bg-yellow-100",
    desc: "1×1 conv + 2×2 avg pool",
  },
  {
    name: "Dense Block 4",
    size: "7×7×1024",
    color: "bg-green-100",
    desc: "16 dense layers",
  },
  {
    name: "Global Pooling",
    size: "1×1×1024",
    color: "bg-purple-100",
    desc: "7×7 global average pool",
  },
  {
    name: "Fully Connected",
    size: "1000",
    color: "bg-red-100",
    desc: "1024 input features",
  },
  {
    name: "Output",
    size: "2",
    color: "bg-gray-100",
    desc: "TB detection: positive/negative",
  },
];

export default function MetricsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">
              Model Evaluation Metrics
            </h1>

            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="performance">Model Performance</TabsTrigger>
                <TabsTrigger value="confusion">Confusion Matrix</TabsTrigger>
                <TabsTrigger value="architecture">
                  DenseNet-121 Architecture
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                {/* Bar Chart for Accuracy, Precision, Recall, F1 Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Key metrics of the TB detection model using DenseNet-121
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={performanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0.8, 1]} />
                          <Tooltip
                            formatter={(value) =>
                              (Number(value) * 100).toFixed(1) + "%"
                            }
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            name="Score"
                            label={{
                              position: "top",
                              formatter: (value: number) =>
                                (value * 100).toFixed(1) + "%",
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* ROC Curve for AUC-ROC */}
                <Card>
                  <CardHeader>
                    <CardTitle>AUC-ROC Curve</CardTitle>
                    <CardDescription>
                      Receiver Operating Characteristic (ROC) curve with AUC ={" "}
                      {aucValue.toFixed(3)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="fpr"
                            label={{
                              value: "False Positive Rate",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            dataKey="tpr"
                            label={{
                              value: "True Positive Rate",
                              angle: -90,
                              position: "insideLeft",
                              offset: 10,
                            }}
                          />
                          <Tooltip
                            formatter={(value, name) =>
                              name === "tpr"
                                ? `TPR: ${Number(value).toFixed(3)}`
                                : `FPR: ${Number(value).toFixed(3)}`
                            }
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            data={rocData}
                            dataKey="tpr"
                            stroke="#3b82f6"
                            name="ROC Curve"
                            dot={false}
                          />
                          <Line
                            type="linear"
                            data={baselineData}
                            dataKey="tpr"
                            stroke="#8884d8"
                            strokeDasharray="5 5"
                            name="Baseline (AUC=0.5)"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
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
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart
                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                          >
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
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
                            <Tooltip formatter={(value) => `${value} cases`} />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="architecture" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>DenseNet-121 Architecture</CardTitle>
                    <CardDescription>
                      Architecture details of the DenseNet-121 model used for TB
                      detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          Architecture Overview
                        </h3>
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Type</td>
                              <td className="py-2">
                                Convolutional Neural Network
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Depth</td>
                              <td className="py-2">121 layers</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Parameters</td>
                              <td className="py-2">~8 million</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Input Size</td>
                              <td className="py-2">224×224×3</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Dense Blocks</td>
                              <td className="py-2">4</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">Growth Rate</td>
                              <td className="py-2">32</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          Performance Details
                        </h3>
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 font-medium">
                                Inference Time
                              </td>
                              <td className="py-2">45ms</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Accuracy</td>
                              <td className="py-2">93.2%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">Model Size</td>
                              <td className="py-2">33MB</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">
                                Implementation
                              </td>
                              <td className="py-2">PyTorch</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">
                                Training Time
                              </td>
                              <td className="py-2">~4 hours on NVIDIA T4</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Layer Structure Visualization</CardTitle>
                    <CardDescription>
                      Step-by-step layer structure of DenseNet-121
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-2xl">
                        {densenetLayers.map((layer, idx, arr) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center mb-2"
                          >
                            <div
                              className={`${layer.color} w-full p-3 rounded-lg border shadow-sm text-center`}
                            >
                              <h4 className="font-medium">{layer.name}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                Output: {layer.size}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {layer.desc}
                              </div>
                              {layer.name.includes("Dense Block") && (
                                <div className="mt-2 bg-green-200 rounded p-1 text-xs inline-block">
                                  {layer.name === "Dense Block 1" &&
                                    "6 × 2 = 12 layers"}
                                  {layer.name === "Dense Block 2" &&
                                    "12 × 2 = 24 layers"}
                                  {layer.name === "Dense Block 3" &&
                                    "24 × 2 = 48 layers"}
                                  {layer.name === "Dense Block 4" &&
                                    "16 × 2 = 32 layers"}
                                </div>
                              )}
                              {(layer.name === "Convolution" ||
                                layer.name.includes("Transition") ||
                                layer.name === "Fully Connected") && (
                                <div className="mt-2 bg-blue-200 rounded p-1 text-xs inline-block">
                                  1 layer
                                </div>
                              )}
                            </div>
                            {idx < arr.length - 1 && (
                              <div className="h-6 w-0.5 bg-gray-300 my-1">
                                <div className="h-2 w-2 bg-gray-400 rounded-full mx-auto -mt-1"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dense Block Structure</CardTitle>
                    <CardDescription>
                      Detailed view of a Dense Block's internal structure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-6">
                      <div className="rounded-lg border p-4 bg-green-50 max-w-md">
                        <h4 className="font-medium text-center mb-4">
                          Dense Block Architecture
                        </h4>
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="bg-blue-100 p-2 rounded border text-center w-32">
                              <span className="text-sm">Previous Layers</span>
                            </div>
                            <ChevronRight size={16} />
                            <div className="bg-yellow-100 p-2 rounded border text-center w-24">
                              <span className="text-sm">Concat</span>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <div className="bg-green-100 p-2 rounded border text-center w-48">
                              <span className="text-sm">
                                1×1 Conv (Bottleneck){" "}
                                <span className="text-xs font-medium">
                                  [Layer 1]
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <div className="bg-green-100 p-2 rounded border text-center w-48">
                              <span className="text-sm">
                                3×3 Conv{" "}
                                <span className="text-xs font-medium">
                                  [Layer 2]
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="bg-blue-100 p-2 rounded border text-center w-32">
                              <span className="text-sm">
                                All Previous Layers
                              </span>
                            </div>
                            <ChevronRight size={16} />
                            <div className="bg-purple-100 p-2 rounded border text-center w-24">
                              <span className="text-sm">New Features</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          Each dense layer contributes 2 trainable layers to the
                          network
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          Dense Layer Composition
                        </h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            Each dense layer consists of two sequential
                            operations:
                            <ul className="list-circle pl-6 mt-1 space-y-1">
                              <li>
                                1×1 convolution (bottleneck layer) - reduces
                                feature dimensions
                              </li>
                              <li>3×3 convolution - extracts new features</li>
                            </ul>
                          </li>
                          <li>
                            Each of these operations counts as one layer in the
                            network
                          </li>
                          <li>
                            A dense block with 6 dense layers actually contains
                            12 convolutional layers
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          Dense Block Distribution
                        </h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-200 p-2">
                                Block
                              </th>
                              <th className="border border-gray-200 p-2">
                                Dense Layers
                              </th>
                              <th className="border border-gray-200 p-2">
                                Total Layers
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-200 p-2">
                                Dense Block 1
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                6
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                12
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-2">
                                Dense Block 2
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                12
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                24
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-2">
                                Dense Block 3
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                24
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                48
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-2">
                                Dense Block 4
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                16
                              </td>
                              <td className="border border-gray-200 p-2 text-center">
                                32
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Understanding the "121" in DenseNet-121
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of how DenseNet-121 gets its 121 layers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 p-2 text-left">
                              Section
                            </th>
                            <th className="border border-gray-200 p-2 text-left">
                              Component
                            </th>
                            <th className="border border-gray-200 p-2 text-left">
                              Details
                            </th>
                            <th className="border border-gray-200 p-2 text-center">
                              Layer Count
                            </th>
                            <th className="border border-gray-200 p-2 text-center">
                              Running Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              className="border border-gray-200 p-2"
                              rowSpan={2}
                            >
                              Initial Layers
                            </td>
                            <td className="border border-gray-200 p-2">
                              Convolution
                            </td>
                            <td className="border border-gray-200 p-2">
                              7×7 conv, stride 2
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">
                              Max Pooling
                            </td>
                            <td className="border border-gray-200 p-2">
                              3×3 max pool, stride 2
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              0
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="border border-gray-200 p-2">
                              Dense Block 1
                            </td>
                            <td className="border border-gray-200 p-2">
                              6 Dense Layers
                            </td>
                            <td className="border border-gray-200 p-2">
                              Each dense layer: 1×1 conv + 3×3 conv (2 layers)
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              6 × 2 = 12
                            </td>
                            <td className="border border-gray-200 p-2 text-center font-medium">
                              13
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-200 p-2"
                              rowSpan={2}
                            >
                              Transition Layer 1
                            </td>
                            <td className="border border-gray-200 p-2">
                              Convolution
                            </td>
                            <td className="border border-gray-200 p-2">
                              1×1 conv
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              14
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">
                              Avg Pooling
                            </td>
                            <td className="border border-gray-200 p-2">
                              2×2 avg pool
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              0
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              14
                            </td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="border border-gray-200 p-2">
                              Dense Block 2
                            </td>
                            <td className="border border-gray-200 p-2">
                              12 Dense Layers
                            </td>
                            <td className="border border-gray-200 p-2">
                              Each dense layer: 1×1 conv + 3×3 conv (2 layers)
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              12 × 2 = 24
                            </td>
                            <td className="border border-gray-200 p-2 text-center font-medium">
                              38
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-200 p-2"
                              rowSpan={2}
                            >
                              Transition Layer 2
                            </td>
                            <td className="border border-gray-200 p-2">
                              Convolution
                            </td>
                            <td className="border border-gray-200 p-2">
                              1×1 conv
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              39
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">
                              Avg Pooling
                            </td>
                            <td className="border border-gray-200 p-2">
                              2×2 avg pool
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              0
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              39
                            </td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="border border-gray-200 p-2">
                              Dense Block 3
                            </td>
                            <td className="border border-gray-200 p-2">
                              24 Dense Layers
                            </td>
                            <td className="border border-gray-200 p-2">
                              Each dense layer: 1×1 conv + 3×3 conv (2 layers)
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              24 × 2 = 48
                            </td>
                            <td className="border border-gray-200 p-2 text-center font-medium">
                              87
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-200 p-2"
                              rowSpan={2}
                            >
                              Transition Layer 3
                            </td>
                            <td className="border border-gray-200 p-2">
                              Convolution
                            </td>
                            <td className="border border-gray-200 p-2">
                              1×1 conv
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              88
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">
                              Avg Pooling
                            </td>
                            <td className="border border-gray-200 p-2">
                              2×2 avg pool
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              0
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              88
                            </td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="border border-gray-200 p-2">
                              Dense Block 4
                            </td>
                            <td className="border border-gray-200 p-2">
                              16 Dense Layers
                            </td>
                            <td className="border border-gray-200 p-2">
                              Each dense layer: 1×1 conv + 3×3 conv (2 layers)
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              16 × 2 = 32
                            </td>
                            <td className="border border-gray-200 p-2 text-center font-medium">
                              120
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-200 p-2"
                              rowSpan={2}
                            >
                              Classification
                            </td>
                            <td className="border border-gray-200 p-2">
                              Global Avg Pooling
                            </td>
                            <td className="border border-gray-200 p-2">
                              7×7 global average pool
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              0
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              120
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">
                              Fully Connected
                            </td>
                            <td className="border border-gray-200 p-2">
                              Linear classification layer
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              1
                            </td>
                            <td className="border border-gray-200 p-2 text-center font-bold">
                              121
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-lg mb-2">
                        Key Points about the Layer Count
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>
                          Each <span className="font-medium">Dense Layer</span>{" "}
                          consists of two convolutions (1×1 bottleneck + 3×3
                          conv), counting as{" "}
                          <span className="font-medium">2 layers</span>
                        </li>
                        <li>
                          Pooling operations (max pooling and average pooling)
                          are not counted as layers
                        </li>
                        <li>
                          The model contains 4 Dense Blocks with varying numbers
                          of dense layers: 6, 12, 24, and 16
                        </li>
                        <li>
                          Each Transition Layer contains a single 1×1
                          convolution, counting as 1 layer
                        </li>
                        <li>
                          The initial 7×7 convolution and final fully connected
                          layer each count as 1 layer
                        </li>
                        <li>
                          Total: 1 + (6×2) + 1 + (12×2) + 1 + (24×2) + 1 +
                          (16×2) + 1 = 121 layers
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
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
