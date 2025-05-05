"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  IconUpload,
  IconX,
  IconCircleCheck,
  IconAlertCircle,
  IconLungs,
} from "@tabler/icons-react";

export default function PrediksiPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    status: "positive" | "negative" | null;
    confidence: number | null;
    details?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);

      // Generate preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Reset result when new file is selected
      setResult(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  const analyzeSample = () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    // Simulate analysis with timeout (replace with actual API call)
    setTimeout(() => {
      // For demo purposes, generate random result
      // In production, this would be replaced with actual API response
      const isPositive = Math.random() > 0.7;
      const confidence = 85 + Math.floor(Math.random() * 10);

      setResult({
        status: isPositive ? "positive" : "negative",
        confidence: confidence,
        details: isPositive
          ? "Analysis shows signs consistent with tuberculosis infection. Please consult with a healthcare professional for further examination."
          : "No significant signs of tuberculosis detected in the sample.",
      });

      setIsAnalyzing(false);
    }, 2000);
  };

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
                  Prediksi TB (Tuberculosis Detection)
                </h1>

                <Tabs defaultValue="x-ray" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="x-ray">X-Ray Analysis</TabsTrigger>
                    <TabsTrigger value="sputum">Sputum Sample</TabsTrigger>
                    <TabsTrigger value="symptoms">
                      Symptoms Analysis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="x-ray" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>X-Ray Image Analysis</CardTitle>
                        <CardDescription>
                          Upload a chest X-ray image for tuberculosis detection
                          analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              {!selectedFile ? (
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <IconUpload className="h-10 w-10 text-gray-400" />
                                  <div className="text-sm text-gray-500">
                                    Upload X-ray image in JPG, PNG or DICOM
                                    format
                                  </div>
                                  <Label
                                    htmlFor="x-ray-upload"
                                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium cursor-pointer"
                                  >
                                    Choose File
                                  </Label>
                                  <Input
                                    id="x-ray-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.dcm"
                                    onChange={handleFileChange}
                                  />
                                </div>
                              ) : (
                                <div className="relative">
                                  {preview ? (
                                    <img
                                      src={preview}
                                      alt="X-ray preview"
                                      className="max-h-64 max-w-full mx-auto"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                                      <span className="text-sm text-gray-500">
                                        {selectedFile.name}
                                      </span>
                                    </div>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white shadow-sm"
                                    onClick={clearFile}
                                  >
                                    <IconX className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {selectedFile && (
                              <Button
                                className="w-full"
                                onClick={analyzeSample}
                                disabled={isAnalyzing}
                              >
                                {isAnalyzing ? "Analyzing..." : "Analyze X-ray"}
                              </Button>
                            )}
                          </div>

                          <div>
                            {result ? (
                              <div className="space-y-4">
                                <Alert
                                  className={
                                    result.status === "positive"
                                      ? "bg-red-50 border-red-200"
                                      : "bg-green-50 border-green-200"
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    {result.status === "positive" ? (
                                      <IconAlertCircle className="h-5 w-5 text-red-600" />
                                    ) : (
                                      <IconCircleCheck className="h-5 w-5 text-green-600" />
                                    )}
                                    <AlertTitle
                                      className={
                                        result.status === "positive"
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }
                                    >
                                      {result.status === "positive"
                                        ? "TB Detected"
                                        : "No TB Detected"}
                                    </AlertTitle>
                                  </div>
                                  <AlertDescription className="mt-2">
                                    {result.details}
                                  </AlertDescription>
                                </Alert>

                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                      Detection Results
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Analysis confidence:
                                        </span>
                                        <span className="font-medium">
                                          {result.confidence}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Result:
                                        </span>
                                        <span
                                          className={`font-medium ${
                                            result.status === "positive"
                                              ? "text-red-600"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {result.status === "positive"
                                            ? "Positive"
                                            : "Negative"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Date:
                                        </span>
                                        <span className="font-medium">
                                          {new Date().toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="flex gap-2 items-start">
                                    <IconLungs className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-blue-800">
                                        Next Steps
                                      </h4>
                                      <p className="text-sm text-blue-700 mt-1">
                                        {result.status === "positive"
                                          ? "Please consult with a healthcare professional immediately. This AI detection is not a clinical diagnosis, but indicates further medical evaluation is necessary."
                                          : "While no TB signs were detected, if you experience persistent symptoms, please consult with a healthcare professional. Regular check-ups are recommended."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
                                <IconLungs className="h-16 w-16 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-700">
                                  Detection Results
                                </h3>
                                <p className="text-sm max-w-md">
                                  Upload an X-ray image and click "Analyze" to
                                  begin the TB detection process. Results will
                                  appear here.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="text-xs text-gray-500 border-t pt-4">
                        Note: This AI-based detection tool is meant to assist
                        healthcare professionals and should not replace clinical
                        diagnosis.
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>How It Works</CardTitle>
                        <CardDescription>
                          Understanding the X-ray based TB detection process
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium mb-2">
                              1. Image Processing
                            </div>
                            <p className="text-gray-600">
                              The uploaded X-ray image is preprocessed to
                              enhance features that may indicate tuberculosis
                              infection.
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium mb-2">
                              2. AI Analysis
                            </div>
                            <p className="text-gray-600">
                              Our advanced convolutional neural network, trained
                              on thousands of X-ray images, analyzes the
                              preprocessed image.
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium mb-2">
                              3. Result Generation
                            </div>
                            <p className="text-gray-600">
                              The AI provides a detection result with confidence
                              score based on identified patterns associated with
                              TB infection.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sputum" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sputum Sample Analysis</CardTitle>
                        <CardDescription>
                          Upload sputum sample microscopy images for TB
                          detection
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-8 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
                            <IconAlertCircle className="h-6 w-6 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-medium">Coming Soon</h3>
                          <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            The sputum sample analysis module is under
                            development and will be available in the next
                            update.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="symptoms" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Symptoms Analysis</CardTitle>
                        <CardDescription>
                          Check TB risk based on reported symptoms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-8 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
                            <IconAlertCircle className="h-6 w-6 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-medium">Coming Soon</h3>
                          <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            The symptoms analysis module is under development
                            and will be available in the next update.
                          </p>
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
