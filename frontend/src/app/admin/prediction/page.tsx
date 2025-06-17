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
    age?: number;
  } | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userAge, setUserAge] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
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

    // Validate phone number (only digits, optional + prefix, and common separators)
    if (userPhone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
      const digitOnlyPhone = userPhone.replace(/[\s\-\(\)\+]/g, "");

      if (!phoneRegex.test(userPhone) || digitOnlyPhone.length < 8) {
        setError("Nomor telepon harus berisi angka (8-20 digit)");
        toast.error("Nomor telepon harus berisi angka (8-20 digit)");
        return;
      }
    }

    const ageNumber = parseInt(userAge);
    if (userAge && (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 150)) {
      setError("Umur harus antara 0 dan 150");
      toast.error("Umur harus antara 0 dan 150");
      return;
    }

    try {
      console.log("Submitting user:", {
        userName,
        userRegion,
        userPhone,
        userGender,
        userAge: ageNumber || null,
      });
      const response = await axios.post("/api/v1/users/temp", {
        name: userName,
        region: userRegion,
        phone: userPhone || null,
        gender: userGender || null,
        age: ageNumber || null,
      });
      console.log("User created:", response.data);

      setUserData({
        userId: response.data.userId,
        name: userName,
        dateTime: getCurrentDateTime(),
        region: userRegion,
        phone: userPhone,
        gender: userGender,
        age: ageNumber || undefined,
      });

      setShowUserDialog(false);
      setUserName("");
      setUserRegion("");
      setUserPhone("");
      setUserGender("");
      setUserAge("");
      setError("");
      setPhoneError("");
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
        age: userData.age || null,
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
                                <tr className="border-b">
                                  <td className="py-2 text-gray-500 font-medium">
                                    Gender
                                  </td>
                                  <td className="py-2">
                                    {userData.gender === "male"
                                      ? "Male"
                                      : userData.gender === "female"
                                      ? "Female"
                                      : userData.gender === "other"
                                      ? "Other"
                                      : ""}
                                  </td>
                                </tr>
                              )}
                              {userData.age && (
                                <tr className="border-b">
                                  <td className="py-2 text-gray-500 font-medium">
                                    Age
                                  </td>
                                  <td className="py-2">{userData.age}</td>
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
                              setUserAge(userData.age?.toString() || "");
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
                    </div>{" "}
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone Number</Label>
                      <Input
                        id="userPhone"
                        type="tel"
                        placeholder="Enter phone number (optional)"
                        value={userPhone}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const validChars = /^[\+]?[0-9\s\-\(\)]*$/;

                          if (
                            inputValue === "" ||
                            validChars.test(inputValue)
                          ) {
                            setUserPhone(inputValue);
                            setPhoneError("");
                          } else {
                            setPhoneError(
                              "Only numbers, spaces, hyphens, parentheses, and plus signs are allowed."
                            );
                          }
                        }}
                        className={
                          phoneError
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                        pattern="[\+]?[0-9\s\-\(\)]{8,20}"
                        title="Phone number should contain 8-20 digits and may include +, spaces, hyphens, or parentheses"
                      />
                      {phoneError && (
                        <p className="text-sm text-red-500">{phoneError}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userGender">Gender</Label>
                        <Select
                          value={userGender}
                          onValueChange={setUserGender}
                        >
                          <SelectTrigger id="userGender">
                            <SelectValue placeholder="Select gender (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userAge">Age</Label>
                        <Input
                          id="userAge"
                          type="number"
                          placeholder="Enter age (optional)"
                          value={userAge}
                          onChange={(e) => setUserAge(e.target.value)}
                        />
                      </div>
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
                        setUserAge("");
                        setError("");
                        setPhoneError("");
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
