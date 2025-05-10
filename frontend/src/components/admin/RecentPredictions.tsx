// components/admin/RecentPredictions.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Tambah Button
import { IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";

interface Prediction {
  id: string;
  patientName: string;
  date: string;
  status: "positive" | "negative";
  confidence: number;
}

interface RecentPredictionsProps {
  predictions: Prediction[];
  title?: string;
  description?: string;
  maxItems?: number;
  onShowAllClick?: () => void; // Tambah prop
}

export function RecentPredictions({
  predictions,
  title = "Recent Predictions",
  description = "Latest TB detection results",
  maxItems = 5,
  onShowAllClick,
}: RecentPredictionsProps) {
  const displayPredictions = predictions.slice(0, maxItems);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "positive":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <IconAlertCircle className="h-3.5 w-3.5 mr-1" />
            Positive
          </Badge>
        );
      case "negative":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <IconCircleCheck className="h-3.5 w-3.5 mr-1" />
            Negative
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Unknown
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {displayPredictions.length > 0 ? (
          <div className="space-y-4">
            {displayPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{prediction.patientName}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(prediction.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <span className="font-medium">
                      {prediction.confidence}%
                    </span>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                  {getStatusBadge(prediction.status)}
                </div>
              </div>
            ))}
            {onShowAllClick && predictions.length > 0 && (
              <div className="mt-4 text-right">
                <Button
                  onClick={onShowAllClick}
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  Show All Predictions
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No recent predictions available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
