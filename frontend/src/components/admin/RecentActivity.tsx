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
  id?: string;
  userId?: string;
  user?: string;
  date: string;
  region?: string;
  result: string;
  confidence: string;
}

interface RecentActivityProps {
  activityData: ActivityData[];
  limit?: number;
  onShowAllClick?: () => void;
  title: string;
  description: string;
}

export const RecentActivity = ({
  activityData,
  limit = 6,
  onShowAllClick,
  title,
  description,
}: RecentActivityProps) => {
  // Limit jumlah data yang ditampilkan
  const displayData = activityData.slice(0, limit);

  // Cek apakah field tertentu ada di data untuk render kolom
  const hasUserId = displayData.some((activity) => activity.userId);
  const hasUser = displayData.some((activity) => activity.user);
  const hasRegion = displayData.some((activity) => activity.region);

  // Format userId: ambil sebelum '-', uppercase, max 9 karakter
  const formatUserId = (userId?: string) => {
    if (!userId) return "-";
    const shortId = userId.includes("-") ? userId.split("-")[0] : userId;
    return shortId.toUpperCase().slice(0, 9);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {hasUserId && (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    ID
                  </th>
                )}
                {hasUser && (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Full Name
                  </th>
                )}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Date & Time
                </th>
                {hasRegion && (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Region
                  </th>
                )}
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
                  key={activity.id || index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  {hasUserId && (
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {formatUserId(activity.userId)}
                    </td>
                  )}
                  {hasUser && (
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {activity.user || "-"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {activity.date}
                  </td>
                  {hasRegion && (
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {activity.region || "-"}
                    </td>
                  )}
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
