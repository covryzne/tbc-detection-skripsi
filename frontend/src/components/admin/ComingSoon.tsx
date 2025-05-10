import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconAlertCircle } from "@tabler/icons-react";

interface ComingSoonProps {
  title: string;
  description: string;
  message?: string;
}

export function ComingSoon({
  title,
  description,
  message = "This feature is under development and will be available in the next update.",
}: ComingSoonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
            <IconAlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
