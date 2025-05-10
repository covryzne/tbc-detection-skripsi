import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FileUploader } from "./FileUploader";
import { PredictionResultCard } from "./PredictionResultCard";

interface PredictionAnalyzerProps {
  title: string;
  description: string;
  fileTypes: string;
  fileTypesDescription: string;
  analyzeButtonText?: string;
  analyzingText?: string;
  footerNote?: string;
  userId?: string;
  onFileSelected?: (file: File | null) => void;
  onAnalyzeRequested?: (file: File) => Promise<any>;
  onSaveResult?: (result: any) => boolean;
}

export function PredictionAnalyzer({
  title,
  description,
  fileTypes,
  fileTypesDescription,
  analyzeButtonText = "Analyze",
  analyzingText = "Analyzing...",
  footerNote = "This AI-based detection tool is meant to assist healthcare professionals and should not replace clinical diagnosis.",
  userId,
  onFileSelected,
  onAnalyzeRequested,
  onSaveResult,
}: PredictionAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    status: "positive" | "negative" | null;
    confidence: number | null;
    details?: string;
    fileName?: string;
    date?: string;
  } | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);

    // Reset result and saved state when new file is selected
    setResult(null);
    setResultSaved(false);

    if (onFileSelected && file) {
      onFileSelected(file);
    }
  };

  const analyzeSample = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      let resultData;

      if (onAnalyzeRequested) {
        // Use the provided analyze function
        resultData = await onAnalyzeRequested(selectedFile);
      } else {
        // Simulate analysis with timeout (default behavior)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate random result for demo purposes
        const rand = Math.random();
        const isPositive = rand > 0.7;
        const confidence = 70 + Math.floor(Math.random() * 25);

        resultData = {
          status: isPositive ? "positive" : "negative",
          confidence: confidence,
          details: isPositive
            ? "Analysis shows signs consistent with tuberculosis infection. Please consult with a healthcare professional for further examination."
            : "No significant signs of tuberculosis detected in the sample.",
        };
      }

      // Add filename and date to result data
      resultData.fileName = selectedFile.name;
      resultData.date = new Date().toLocaleDateString();

      setResult(resultData);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = (resultData: any) => {
    if (onSaveResult) {
      const success = onSaveResult({
        ...resultData,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileType: selectedFile?.type,
        analyzedAt: new Date().toISOString(),
      });

      if (success) {
        setResultSaved(true);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FileUploader
              onFileChange={handleFileChange}
              accept={fileTypes}
              description={fileTypesDescription}
              isProcessing={isAnalyzing}
              onProcess={analyzeSample}
              processButtonText={analyzeButtonText}
              processingText={analyzingText}
            />
          </div>

          <div>
            <PredictionResultCard
              result={result}
              userId={userId}
              onSaveResult={handleSaveResult}
              isSaved={resultSaved}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t pt-4">
        {footerNote}
      </CardFooter>
    </Card>
  );
}
