"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PredictionAnalyzer } from "@/components/admin/PredictionAnalyzer";
import { HowItWorks } from "@/components/admin/HowItWorks";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { toast } from "sonner";

export default function PrediksiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("x-ray");
  const [userData, setUserData] = useState<{
    userId: string | Blob;
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    is_admin: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const xraySteps = [
    {
      title: "Image Processing",
      description:
        "The uploaded X-ray image is preprocessed to enhance features that may indicate tuberculosis infection.",
    },
    {
      title: "AI Analysis",
      description:
        "Our advanced convolutional neural network, trained on thousands of X-ray images, analyzes the preprocessed image.",
    },
    {
      title: "Result Generation",
      description:
        "The AI provides a detection result with confidence score based on identified patterns associated with TB infection.",
    },
  ];

  const sputumSteps = [
    {
      title: "Sample Digitization",
      description:
        "The sputum sample image undergoes preprocessing to enhance bacilli visibility.",
    },
    {
      title: "Bacilli Detection",
      description:
        "Our specialized AI model identifies and counts tuberculosis bacilli in the sample.",
    },
    {
      title: "Risk Assessment",
      description:
        "Based on bacilli count and distribution, a risk assessment is generated.",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          toast.error("No auth token found. Please login again.");
          router.push("/login");
          return;
        }
        const response = await axios.get("/api/v1/users/me");
        setUserData(response.data);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail || "Failed to fetch user data";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAnalyzeRequest = async (file: File) => {
    // console.log("handleAnalyzeRequest called with file:", file.name);
    // console.log("userData:", userData);
    // console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    if (!userData) {
      // console.log("No userData, showing toast");
      toast.error("Harap masukkan data terlebih dahulu", {
        description: "Silakan tambahkan user sebelum melakukan analisis.",
      });
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userData.userId);
      formData.append("type", activeTab);
      const requestId = Math.random().toString(36).substring(7);
      // console.log(`Sending API request [${requestId}]`);

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/v1/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      // console.log(`API Response Status [${requestId}]:`, response.status);
      const result = await response.json();
      // console.log(`API Response [${requestId}]:`, result);
      // console.log(
      //   `Raw Confidence Type [${requestId}]:`,
      //   typeof result.predictions.confidence
      // );
      // console.log(
      //   `Raw Confidence Value [${requestId}]:`,
      //   result.predictions.confidence
      // );

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      let status: "positive" | "negative" | "error";
      const className = result.predictions.class_name.toLowerCase();
      if (className === "tuberculosis" || className === "tbc") {
        status = "positive";
      } else if (className === "normal") {
        status = "negative";
      } else {
        throw new Error(`Unexpected class_name: ${className}`);
      }

      // Ambil confidence langsung dari backend dengan validasi
      let confidence = 0;
      const rawConfidence = result.predictions.confidence;
      if (typeof rawConfidence === "number") {
        // Langsung pake kalau number, asumsikan persen (99.88)
        confidence = Math.min(Math.max(rawConfidence, 0), 100); // Clamp 0-100
      } else if (typeof rawConfidence === "string") {
        // Handle kalau string (misalnya dari DB atau API salah format)
        const parsed = parseFloat(rawConfidence);
        if (!isNaN(parsed)) {
          confidence = parsed >= 1 ? parsed : parsed * 100; // Handle persen atau probabilitas
          confidence = Math.min(Math.max(confidence, 0), 100);
        } else {
          console.warn(`Invalid confidence string: ${rawConfidence}`);
        }
      } else {
        console.warn(
          `Unexpected confidence type: ${typeof rawConfidence}, value: ${rawConfidence}`
        );
      }
      console.log(`Processed Confidence [${requestId}]:`, confidence);

      // Handle inference_time dengan aman
      const inferenceTime = result.inference_time || "N/A";

      return {
        status,
        confidence,
        details: `Inference time: ${inferenceTime}`,
        fileName: file.name,
        date: new Date().toLocaleDateString(),
        fileSize: file.size,
        fileType: file.type,
        analyzedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Error in handleAnalyzeRequest:", err);
      toast.error("Gagal menganalisis file", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return {
        status: "error",
        confidence: 0,
        details:
          err instanceof Error ? err.message : "Failed to analyze the sample.",
        fileName: file.name,
        date: new Date().toLocaleDateString(),
      };
    }
  };

  const handleSaveResult = async (result: any) => {
    if (!userData) return false;

    try {
      await axios.post("/api/v1/predictions/save", {
        status: result.status,
        confidence: result.confidence,
        details: result.details,
        date: result.date,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
      });
      toast.success("Prediction results successfully saved");
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail || "Failed to save prediction";
      console.error("Error saving result:", err);
      toast.error("Failed to save prediction results", {
        description: errorMsg,
      });
      return false;
    }
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tuberculosis Prediction</h1>
            </div>

            <Tabs
              defaultValue="x-ray"
              className="w-full"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="x-ray">X-Ray Analysis</TabsTrigger>
                <TabsTrigger value="sputum">Sputum Sample</TabsTrigger>
              </TabsList>

              <TabsContent value="x-ray" className="space-y-4">
                <PredictionAnalyzer
                  title="X-Ray Image Analysis"
                  description="Upload a chest X-ray image for tuberculosis detection analysis"
                  fileTypes="image/png,image/jpeg"
                  fileTypesDescription="Upload X-ray image in PNG or JPG format"
                  analyzeButtonText="Analyze X-ray"
                  userId={userData?.id}
                  onAnalyzeRequested={handleAnalyzeRequest}
                  onSaveResult={handleSaveResult}
                  hasUser={!!userData}
                  onValidationError={() => {
                    toast.error("User data not loaded", {
                      description: "Please try refreshing the page.",
                    });
                  }}
                />
                <HowItWorks
                  title="How X-Ray Analysis Works"
                  description="Understanding the X-ray based TB detection process"
                  steps={xraySteps}
                />
              </TabsContent>

              <TabsContent value="sputum" className="space-y-4">
                <ComingSoon
                  title="Sputum Sample Analysis"
                  description="Upload sputum sample microscopy images for TB detection"
                  message="The sputum sample analysis module is under development and will be available in the next update."
                />
                <HowItWorks
                  title="How Sputum Analysis Will Work"
                  description="Understanding the sputum-based TB detection process"
                  steps={sputumSteps}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
