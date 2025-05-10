"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";

interface ActivityData {
  userId: string;
  user: string;
  date: string;
  region: string;
  result: string;
  confidence: string;
}

interface RecentActivityProps {
  activityData: ActivityData[];
  limit?: number;
  onShowAllClick?: () => void;
}

export const RecentActivity = ({
  activityData,
  limit = 6,
  onShowAllClick,
}: RecentActivityProps) => {
  // Limit the number of items to display
  const displayData = activityData.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last User Detection Activity</CardTitle>
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
              {displayData.map((activity, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
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
        {onShowAllClick && (
          <div className="mt-4 text-right">
            <div className="flex justify-center">
              <Button onClick={onShowAllClick} variant="outline" size="sm">
                Show All Activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
