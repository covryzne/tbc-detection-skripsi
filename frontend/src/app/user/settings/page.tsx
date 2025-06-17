"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Calendar,
  Lock,
  Hash,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  age: number | null;
  gender: string | null;
  joinDate: string;
  passwordLastChanged: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    age: null,
    gender: null,
    joinDate: "",
    passwordLastChanged: "",
  });  const [tempUserData, setTempUserData] = useState<UserData>({ ...userData });
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndPatient() {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch user data
        const userResponse = await axios.get("/api/v1/users/me");
        const user = userResponse.data;

        // Fetch patient data with fallback
        let patient = {
          name: user.full_name,
          phone: "",
          address: "Tidak diketahui",
          age: null,
          gender: null,
        };
        try {
          const patientResponse = await axios.get("/api/v1/patients/me");
          patient = patientResponse.data;
        } catch (patientError) {
          console.warn(
            "Failed to fetch patient data, using fallback:",
            patientError
          );
        }

        if (!user.id) {
          throw new Error("User ID not found in response");
        }

        const newUserData = {
          id: user.id || "Unknown",
          name: patient.name || user.full_name || "Unknown",
          email: user.email || "Unknown",
          role: user.is_admin ? "Administrator" : "User",
          phone: patient.phone || "",
          address: patient.address || "Tidak diketahui",
          age: patient.age ?? null,
          gender: patient.gender ?? null,
          joinDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unknown",
          passwordLastChanged: user.updated_at
            ? new Date(user.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unknown",
        };
        setUserData(newUserData);
        setTempUserData(newUserData);
      } catch (error) {
        console.error("Error fetching user/patient:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile data"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserAndPatient();
  }, []);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for phone field
    if (name === 'phone') {
      const validChars = /^[\+]?[0-9\s\-\(\)]*$/;
      
      if (value === '' || validChars.test(value)) {
        setTempUserData({
          ...tempUserData,
          [name as keyof UserData]: value,
        });
        setPhoneError(null);
      } else {
        setPhoneError("Only numbers, spaces, hyphens, parentheses, and + sign are allowed");
      }
    } else {
      setTempUserData({
        ...tempUserData,
        [name as keyof UserData]:
          name === "age"
            ? value
              ? parseInt(value)
              : null
            : name === "gender"
            ? value || null
            : value,
      });
    }
  };
  const handleEditToggle = () => {
    if (isEditing) {
      setTempUserData({ ...userData });
      setPhoneError(null);
    }
    setIsEditing(!isEditing);
  };
  const handleSave = async () => {
    try {
      // Validate phone number if provided
      if (tempUserData.phone.trim()) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
        const digitOnlyPhone = tempUserData.phone.replace(/[\s\-\(\)\+]/g, '');
        
        if (!phoneRegex.test(tempUserData.phone) || digitOnlyPhone.length < 8) {
          setPhoneError("Phone number must contain 8-20 digits");
          toast.error("Invalid phone number", {
            description: "Phone number must contain 8-20 digits"
          });
          return;
        }
      }

      // Clear any existing phone error
      setPhoneError(null);

      // Validasi age di frontend
      if (
        tempUserData.age !== null &&
        (tempUserData.age < 0 || tempUserData.age > 150)
      ) {
        throw new Error("Age must be between 0 and 150");
      }
      // Validasi gender di frontend
      if (
        tempUserData.gender !== null &&
        !["male", "female", "other"].includes(tempUserData.gender)
      ) {
        throw new Error("Gender must be male, female, or other");
      }

      // Update patient data
      const patientPayload = {
        name: tempUserData.name,
        phone: tempUserData.phone,
        address: tempUserData.address,
        ...(userData.role === "User" && {
          age: tempUserData.age,
          gender: tempUserData.gender,
        }),
      };
      console.debug("Sending patient update payload:", patientPayload);
      const patientResponse = await axios.patch(
        "/api/v1/patients/me",
        patientPayload
      );

      // Update user data (email)
      const userPayload = {
        email: tempUserData.email,
      };
      console.debug("Sending user update payload:", userPayload);
      let userResponse;
      try {
        userResponse = await axios.patch("/api/v1/users/me", userPayload);
      } catch (userError) {
        console.error("Error updating user:", userError);
        if (
          typeof userError === "object" &&
          userError !== null &&
          "response" in userError &&
          typeof (userError as any).response === "object"
        ) {
          const response = (userError as any).response;
          if (response?.status === 422) {
            throw new Error(
              "Invalid input: Check email format or required fields"
            );
          } else if (response?.status === 400) {
            throw new Error(
              response.data?.detail || "Failed to update user data"
            );
          }
        }
        throw userError;
      }

      setUserData({
        ...tempUserData,
        name: patientResponse.data.name,
        phone: patientResponse.data.phone || "",
        address: patientResponse.data.address || "",
        age: patientResponse.data.age ?? null,
        gender: patientResponse.data.gender ?? null,
        email: userResponse.data.email,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully", {
        description: "Your personal information has been saved.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save profile data";
      toast.error("Failed to update profile", {
        description: errorMsg,
      });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const payload = {
        password: newPassword,
        confirm_password: confirmPassword,
      };
      console.debug("Sending password update payload:", payload);
      const response = await axios.patch("/api/v1/users/me", payload);
      const updatedUser = response.data;

      setUserData({
        ...userData,
        email: updatedUser.email,
        passwordLastChanged: updatedUser.updated_at
          ? new Date(updatedUser.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : userData.passwordLastChanged,
      });
      setTempUserData({
        ...tempUserData,
        email: updatedUser.email,
        passwordLastChanged: updatedUser.updated_at
          ? new Date(updatedUser.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : tempUserData.passwordLastChanged,
      });
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordDialogOpen(false);
      toast.success("Password changed successfully", {
        description: "Your new password has been set.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to change password";
      setPasswordError(errorMsg);
      toast.error("Failed to change password", {
        description: errorMsg,
      });
    }
  };

  const formatUserId = (id: string) => {
    return id.toUpperCase().split("-")[0];
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="relative mb-20">
              <div className="h-52 bg-[#001a6e] rounded-xl overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                  <svg
                    className="w-full h-full opacity-20"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,0 L100,0 L100,25 C75,50 50,25 25,50 L0,25 Z"
                      fill="rgba(255,255,255,0.2)"
                    ></path>
                    <path
                      d="M0,40 L100,40 L100,65 C75,90 50,65 25,90 L0,65 Z"
                      fill="rgba(255,255,255,0.1)"
                    ></path>
                  </svg>
                </div>
                <div className="absolute top-0 right-0 p-6">
                  {!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-md text-black rounded-lg hover:bg-opacity-30 transition-all shadow-md"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-green-500 bg-opacity-90 backdrop-blur-md text-white rounded-lg hover:bg-opacity-100 transition-all shadow-md"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-md text-black rounded-lg hover:bg-opacity-30 transition-all shadow-md"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute left-0 right-0 -bottom-16 flex items-end justify-center md:justify-start md:left-8">
                <div className="flex flex-col md:flex-row items-center md:items-end">
                  <div className="w-28 h-28 rounded-xl bg-white p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-lg bg-[#001a6e] flex items-center justify-center text-white text-3xl font-bold">
                      {userData.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>
                  </div>
                  <div className="ml-0 md:ml-5 mt-2 md:mt-0 mb-0 md:mb-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userData.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start space-x-3 mt-1">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {userData.role}
                      </span>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Joined {userData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-24">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6 grid grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            User ID
                          </label>
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-800">
                              {formatUserId(userData.id)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={tempUserData.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          ) : (
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-gray-800">
                                {userData.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={tempUserData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-gray-800">
                                {userData.email}
                              </span>
                            </div>
                          )}
                        </div>                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="tel"
                                name="phone"
                                value={tempUserData.phone}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                  phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter phone number (optional)"
                                title="Phone number should contain 8-20 digits and may include +, spaces, hyphens, or parentheses"
                              />
                              {phoneError && (
                                <p className="text-sm text-red-500">{phoneError}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Phone className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-gray-800">
                                {userData.phone || "Not set"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address"
                              value={tempUserData.address}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          ) : (
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-gray-800">
                                {userData.address || "Not set"}
                              </span>
                            </div>
                          )}
                        </div>
                        {userData.role === "User" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  name="age"
                                  value={tempUserData.age ?? ""}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  min="0"
                                  max="150"
                                />
                              ) : (
                                <div className="flex items-center">
                                  <Hash className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="text-gray-800">
                                    {userData.age !== null
                                      ? userData.age
                                      : "Not set"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                              </label>
                              {isEditing ? (
                                <select
                                  name="gender"
                                  value={tempUserData.gender ?? ""}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                  <option value="">Select gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              ) : (
                                <div className="flex items-center">
                                  <User className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="text-gray-800">
                                    {userData.gender !== null
                                      ? userData.gender
                                      : "Not set"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {userData.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security and authentication options
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          {
                            title: "Password",
                            status: `Last changed ${userData.passwordLastChanged}`,
                            icon: <Lock className="h-5 w-5 text-yellow-500" />,
                          },
                        ].map((setting, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                          >
                            <div className="flex items-center">
                              {setting.icon}
                              <div className="ml-4">
                                <div className="font-medium">
                                  {setting.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {setting.status}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsPasswordDialogOpen(true)}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Change
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
