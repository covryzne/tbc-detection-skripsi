import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconLungs,
  IconDeviceFloppy,
} from "@tabler/icons-react";

interface PredictionResultProps {
  result: {
    status: "positive" | "negative" | "error" | null;
    confidence: number | null;
    details?: string;
    date?: string;
  } | null;
  userId?: string;
  onSaveResult?: (result: any) => void;
  isSaved?: boolean;
}

export function PredictionResultCard({
  result,
  userId,
  onSaveResult,
  isSaved = false,
}: PredictionResultProps) {
  console.log("PredictionResultCard props:", {
    userId,
    onSaveResult,
    result,
    isSaved,
  }); // Tambah logging
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
        <IconLungs className="h-16 w-16 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-700">Detection Results</h3>
        <p className="text-sm max-w-md">
          Upload an X-ray image and click "Analyze" to begin the TB detection
          process. Results will appear here.
        </p>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (result.status) {
      case "positive":
        return {
          icon: <IconAlertCircle className="h-5 w-5 text-red-600" />,
          title: "TB Detected",
          alertClass: "bg-red-50 border-red-200",
          titleClass: "text-red-600",
          statusClass: "text-red-600",
          statusText: "Positive (TBC)",
        };
      case "negative":
        return {
          icon: <IconCircleCheck className="h-5 w-5 text-green-600" />,
          title: "No TB Detected",
          alertClass: "bg-green-50 border-green-200",
          titleClass: "text-green-600",
          statusClass: "text-green-600",
          statusText: "Negative (Normal)",
        };
      case "error":
        return {
          icon: <IconAlertCircle className="h-5 w-5 text-gray-600" />,
          title: "Analysis Failed",
          alertClass: "bg-gray-50 border-gray-200",
          titleClass: "text-gray-600",
          statusClass: "text-gray-600",
          statusText: "Error",
        };
      default:
        return {
          icon: <IconAlertCircle className="h-5 w-5 text-gray-600" />,
          title: "Unknown Result",
          alertClass: "bg-gray-50 border-gray-200",
          titleClass: "text-gray-600",
          statusClass: "text-gray-600",
          statusText: "Unknown",
        };
    }
  };

  const config = getStatusConfig();

  const getNextStepsText = () => {
    switch (result.status) {
      case "positive":
        return "Segera konsultasikan dengan tenaga medis profesional. Deteksi AI ini bukan diagnosis klinis, tetapi menunjukkan perlunya evaluasi medis lebih lanjut.";
      case "negative":
        return "Tidak ada tanda-tanda TBC terdeteksi. Namun, jika Anda mengalami gejala yang berlangsung lama, konsultasikan dengan tenaga medis profesional. Pemeriksaan rutin disarankan.";
      case "error":
        return "Terjadi kesalahan saat analisis. Silakan coba unggah ulang gambar atau hubungi dukungan jika masalah berlanjut.";
      default:
        return "Silakan konsultasikan dengan tenaga medis profesional untuk evaluasi dan diagnosis yang tepat.";
    }
  };

  const handleSave = () => {
    if (onSaveResult && result) {
      onSaveResult({
        ...result,
        date: result.date || new Date().toLocaleDateString(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <Alert className={config.alertClass}>
        <div className="flex items-center gap-2">
          {config.icon}
          <AlertTitle className={config.titleClass}>{config.title}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">{result.details}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detection Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Analysis confidence:
              </span>
              <span className="font-medium">
                {result.confidence !== null ? `${result.confidence}%` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Result:</span>
              <span className={`font-medium ${config.statusClass}`}>
                {config.statusText}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date:</span>
              <span className="font-medium">
                {result.date || new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
        {onSaveResult && userId && result.status !== "error" && (
          <CardFooter className="pt-2 pb-3 border-t">
            <Button
              className="w-full"
              variant={isSaved ? "outline" : "default"}
              onClick={handleSave}
              disabled={isSaved}
            >
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {isSaved ? "Result Saved" : "Save Result"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex gap-2 items-start">
          <IconLungs className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Langkah Selanjutnya</h4>
            <p className="text-sm text-blue-700 mt-1">{getNextStepsText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
