"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Step {
  title: string;
  description: string;
}

interface HowItWorksProps {
  title: string;
  description: string;
  steps: Step[];
}

export function HowItWorks({ title, description, steps }: HowItWorksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center justify-center rounded-full w-8 h-8 bg-primary text-primary-foreground font-medium">
                  {index + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
