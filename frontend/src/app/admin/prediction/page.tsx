// src/app/admin/prediction/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PredictionAnalyzer } from "@/components/admin/PredictionAnalyzer";
import { HowItWorks } from "@/components/admin/HowItWorks";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { Card, CardContent } from "@/components/ui/card";
import { IconDownload, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

export default function PrediksiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("x-ray");
  const [userData, setUserData] = useState<{
    userId: string;
    name: string;
    dateTime: string;
    region: string;
    phone?: string;
    gender?: string;
  } | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userGender, setUserGender] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
  } | null>(null);

  // X-ray detection process steps
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

  // Sputum analysis process steps
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

  // Symptoms analysis process steps
  const symptomsSteps = [
    {
      title: "Symptom Input",
      description:
        "User symptoms and clinical observations are entered into the system.",
    },
    {
      title: "Pattern Recognition",
      description:
        "Our ML algorithms analyze symptom patterns against known TB cases.",
    },
    {
      title: "Risk Stratification",
      description:
        "A risk assessment is provided based on symptom correlation with TB cases.",
    },
    {
      title: "Recommendation",
      description:
        "Specific testing recommendations based on the symptom profile.",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");
    if (!token || !storedUser) {
      console.log("No token or user, redirecting to login...");
      router.push("/login");
      return;
    }
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.is_admin) {
        console.log("User is not admin, redirecting...");
        router.push("/user/dashboard");
      }
      setCurrentUser(parsedUser);
    }
  }, [router]);

  // Function to get current date and time in a formatted string
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleUserSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError("User name is required");
      toast.error("User name is required");
      return;
    }

    if (!userRegion.trim()) {
      setError("Region is required");
      toast.error("Region is required");
      return;
    }

    try {
      console.log("Submitting user:", {
        userName,
        userRegion,
        userPhone,
        userGender,
      });
      const response = await axios.post("/api/v1/users/temp", {
        name: userName,
        region: userRegion,
        phone: userPhone || null,
        gender: userGender || null,
      });
      console.log("User created:", response.data);

      setUserData({
        userId: response.data.userId,
        name: userName,
        dateTime: getCurrentDateTime(),
        region: userRegion,
        phone: userPhone,
        gender: userGender,
      });

      setShowUserDialog(false);
      setUserName("");
      setUserRegion("");
      setUserPhone("");
      setUserGender("");
      setError("");
      toast.success("User berhasil ditambahkan!");
    } catch (err: any) {
      console.error("Error saving user:", err.response?.data || err);
      const errorMsg = err.response?.data?.detail || "Gagal menyimpan user";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Fungsi untuk memicu toast saat memilih file tanpa user
  const handleValidationError = () => {
    toast.error("Harap masukkan data terlebih dahulu", {
      description:
        "Silakan tambahkan user sebelum memilih file untuk analisis.",
    });
  };

  // Simpan hasil prediksi ke backend
  const handleSaveResult = async (result: any) => {
    if (!userData) return false;

    try {
      await axios.post("/api/v1/predictions/save", {
        userId: userData.userId,
        status: result.status,
        confidence: result.confidence,
        details: result.details,
        date: result.date,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        analyzedAt: result.analyzedAt,
        name: userData.name,
        region: userData.region,
        phone: userData.phone || null,
        gender: userData.gender || null,
      });
      toast.success("Hasil prediksi berhasil disimpan");
      return true;
    } catch (err) {
      console.error("Error saving result:", err);
      toast.error("Gagal menyimpan hasil prediksi", {
        description: "Terjadi kesalahan saat menyimpan. Silakan coba lagi.",
      });
      return false;
    }
  };

  // Panggilan API ke /api/v1/predict
  const handleAnalyzeRequest = async (file: File) => {
    if (!userData) {
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

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/v1/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

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

      const confidence = Math.min(
        parseFloat(result.predictions.confidence.toFixed(2)),
        100
      );

      return {
        status,
        confidence,
        details: `Inference time: ${result.inference_time}`,
        fileName: file.name,
        date: new Date().toLocaleDateString(),
        fileSize: file.size,
        fileType: file.type,
        analyzedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Error analyzing file:", err);
      toast.error("Gagal menganalisis file", {
        description:
          (err instanceof Error ? err.message : "Unknown error") ||
          "Terjadi kesalahan saat menganalisis. Silakan coba lagi.",
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tuberculosis Prediction</h1>
              <div className="flex space-x-2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
              <div className="lg:col-span-4">
                <Card>
                  <CardContent className="p-6">
                    {userData ? (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Current User</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 text-gray-500 font-medium">
                                  User ID
                                </td>
                                <td className="py-2">{userData.userId}</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 text-gray-500 font-medium">
                                  Full Name
                                </td>
                                <td className="py-2">{userData.name}</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 text-gray-500 font-medium">
                                  Date & Time
                                </td>
                                <td className="py-2">{userData.dateTime}</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 text-gray-500 font-medium">
                                  Region
                                </td>
                                <td className="py-2">{userData.region}</td>
                              </tr>
                              {userData.phone && (
                                <tr className="border-b">
                                  <td className="py-2 text-gray-500 font-medium">
                                    Phone
                                  </td>
                                  <td className="py-2">{userData.phone}</td>
                                </tr>
                              )}
                              {userData.gender && (
                                <tr>
                                  <td className="py-2 text-gray-500 font-medium">
                                    Gender
                                  </td>
                                  <td className="py-2">
                                    {userData.gender === "male"
                                      ? "Laki-laki"
                                      : userData.gender === "female"
                                      ? "Perempuan"
                                      : "Tidak Disebut"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserName(userData.name);
                              setUserRegion(userData.region);
                              setUserPhone(userData.phone || "");
                              setUserGender(userData.gender || "");
                              setShowUserDialog(true);
                            }}
                          >
                            Change
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserData(null)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <h3 className="font-medium text-lg mb-2">
                          No User Selected
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Add user details before proceeding with analysis
                        </p>
                        <Button onClick={() => setShowUserDialog(true)}>
                          <IconPlus className="h-4 w-4 mr-1" />
                          Add User
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* User Add/Edit Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {userData ? "Edit User" : "Add User to be Predicted"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUserSubmit}>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Full Name</Label>
                      <Input
                        id="userName"
                        placeholder="Enter user name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRegion">Region</Label>
                      <Input
                        id="userRegion"
                        placeholder="Enter user region"
                        value={userRegion}
                        onChange={(e) => setUserRegion(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone Number</Label>
                      <Input
                        id="userPhone"
                        placeholder="Enter phone number (optional)"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userGender">Gender</Label>
                      <Select value={userGender} onValueChange={setUserGender}>
                        <SelectTrigger id="userGender">
                          <SelectValue placeholder="Select gender (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                          <SelectItem value="other">Tidak Disebut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowUserDialog(false);
                        setUserName("");
                        setUserRegion("");
                        setUserPhone("");
                        setUserGender("");
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {userData ? "Update" : "Add"} User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="mt-6">
              <Tabs
                defaultValue="x-ray"
                className="w-full"
                value={activeTab}
                onValueChange={handleTabChange}
              >
                <div className="flex justify-between items-center">
                  <TabsList className="mb-4">
                    <TabsTrigger value="x-ray">X-Ray Analysis</TabsTrigger>
                    <TabsTrigger value="sputum">Sputum Sample</TabsTrigger>
                    <TabsTrigger value="symptoms">
                      Symptoms Analysis
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="x-ray" className="space-y-4">
                  <PredictionAnalyzer
                    title="X-Ray Image Analysis"
                    description="Upload a chest X-ray image for tuberculosis detection analysis"
                    fileTypes="image/png,image/jpeg"
                    fileTypesDescription="Upload X-ray image in PNG or JPG format"
                    analyzeButtonText="Analyze X-ray"
                    userId={userData?.userId}
                    onAnalyzeRequested={handleAnalyzeRequest}
                    onSaveResult={handleSaveResult}
                    hasUser={!!userData}
                    onValidationError={handleValidationError}
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

                <TabsContent value="symptoms" className="space-y-4">
                  <ComingSoon
                    title="Symptoms Analysis"
                    description="Check TB risk based on reported symptoms"
                    message="The symptoms analysis module is under development and will be available in the next update."
                  />
                  <HowItWorks
                    title="How Symptoms Analysis Will Work"
                    description="Understanding the symptoms-based TB risk assessment"
                    steps={symptomsSteps}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
