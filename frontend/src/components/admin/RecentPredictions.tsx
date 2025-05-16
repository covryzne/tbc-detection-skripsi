"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Prediction {
  id?: string;
  userId?: string;
  user?: string;
  date: string;
  region?: string;
  result: string;
  confidence: string;
}

interface RecentPredictionsProps {
  predictions: Prediction[];
  onShowAllClick: () => void;
  title: string;
  description: string;
}

export const RecentPredictions = ({
  predictions,
  onShowAllClick,
  title,
  description,
}: RecentPredictionsProps) => {
  // Fungsi buat format userId: ambil sebelum '-', uppercase, max 9 karakter
  const formatUserId = (userId?: string) => {
    if (!userId) return "";
    const shortId = userId.includes("-") ? userId.split("-")[0] : userId;
    const formattedId = shortId.toUpperCase().slice(0, 9);
    console.log(
      `[RecentPredictions] Formatting userId: ${userId} -> ${formattedId}`
    );
    return formattedId;
  };

  console.log(
    "[RecentPredictions] Received predictions:",
    JSON.stringify(predictions, null, 2)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.length > 0 ? (
            predictions.map((prediction) => (
              <div
                key={prediction.id || formatUserId(prediction.userId)}
                className="flex items-center justify-between"
              >
                <div>
                  {prediction.userId && (
                    <p className="text-sm font-medium">
                      ID: {formatUserId(prediction.userId)}
                    </p>
                  )}
                  {prediction.user && (
                    <p className="text-sm font-medium">{prediction.user}</p>
                  )}
                  <p className="text-sm text-gray-500">{prediction.date}</p>
                  {prediction.region && (
                    <p className="text-sm text-gray-500">
                      Region: {prediction.region}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Result:{" "}
                    <span
                      className={
                        prediction.result === "Positive"
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {prediction.result}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-500">{prediction.confidence}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent predictions</p>
          )}
        </div>
        <Button variant="outline" className="mt-4" onClick={onShowAllClick}>
          Show All
        </Button>
      </CardContent>
    </Card>
  );
};
