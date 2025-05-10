// app/user/prediction/page.tsx
"use client";

import { useState, useEffect, SetStateAction } from "react";
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
import { PredictionAnalyzer } from "@/components/admin/PredictionAnalyzer";
import { HowItWorks } from "@/components/admin/HowItWorks";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { Card, CardContent } from "@/components/ui/card";
import { IconDownload, IconPlus } from "@tabler/icons-react";

export default function PrediksiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("x-ray");
  const [userData, setUserData] = useState<{
    userId: string;
    name: string;
    dateTime: string;
    region: string;
  } | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRegion, setUserRegion] = useState("");
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

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      // Pre-fill userData untuk user yang login
      setUserData({
        userId: parsedUser.id,
        name: parsedUser.name,
        dateTime: getCurrentDateTime(),
        region: parsedUser.region || "Unknown",
      });
    }
  }, []);

  // Function to generate a random user ID (opsional, gak dipake kalau pake ID user asli)
  const generateUserId = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `USR-${randomPart}`;
  };

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

  const handleUserSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError("User name is required");
      return;
    }

    if (!userRegion.trim()) {
      setError("Region is required");
      return;
    }

    // Update userData
    setUserData({
      userId: currentUser?.id || generateUserId(),
      name: userName,
      dateTime: getCurrentDateTime(),
      region: userRegion,
    });

    // Simpan ke backend (opsional)
    axios
      .patch("/api/v1/users/me", { name: userName, region: userRegion })
      .catch((err) => {
        console.error("Error updating user:", err);
      });

    // Close dialog and reset form
    setShowUserDialog(false);
    setUserName("");
    setUserRegion("");
    setError("");
  };

  const handleTabChange = (value: SetStateAction<string>) => {
    setActiveTab(value);
  };

  // Simulate API analysis call
  const handleAnalyzeRequest = async (file: any) => {
    try {
      // Kirim file ke backend untuk analisis
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userData?.userId || "");
      formData.append("type", activeTab);

      const res = await axios.post("/api/v1/predictions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data; // Misal { status: "positive", confidence: 85, details: "..." }
    } catch (err) {
      console.error("Error analyzing file:", err);
      return {
        status: "error",
        confidence: 0,
        details: "Failed to analyze the sample.",
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
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <IconDownload className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
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
                              <tr>
                                <td className="py-2 text-gray-500 font-medium">
                                  Region
                                </td>
                                <td className="py-2">{userData.region}</td>
                              </tr>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRegion">Region</Label>
                      <Input
                        id="userRegion"
                        placeholder="Enter user region"
                        value={userRegion}
                        onChange={(e) => setUserRegion(e.target.value)}
                      />
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
                    onAnalyzeRequested={handleAnalyzeRequest}
                  />
                  <HowItWorks
                    title="How X-Ray Analysis Works"
                    description="Understanding the X-ray based TB detection process"
                    steps={xraySteps}
                  />
                </TabsContent>

                <TabsContent value="sputum" className="space-y-4">
                  <ComingSoon
                    title="Sputu Sample Analysis"
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
