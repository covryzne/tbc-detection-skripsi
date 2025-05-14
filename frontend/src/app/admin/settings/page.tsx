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
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "@/lib/axios";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  joinDate: string;
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
    joinDate: "",
  });
  const [tempUserData, setTempUserData] = useState<UserData>({ ...userData });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        console.log("Token from localStorage:", token);
        console.log("Cookies:", document.cookie);
        const userResponse = await axios.get("/api/v1/users/me");
        console.log("User response:", userResponse.data);
        const user = userResponse.data;

        const profileResponse = await axios.get(
          "/api/v1/users/me/profile-details"
        );
        console.log("Profile response:", profileResponse.data);
        const profile = profileResponse.data;

        const newUserData = {
          id: user.user.id || "Unknown",
          name: user.user.full_name || "Unknown",
          email: user.user.email || "Unknown",
          role: user.user.is_admin ? "Administrator" : "User",
          phone: profile.phone || "",
          address: profile.address || "",
          joinDate: user.user.created_at?.split("T")[0] || "Unknown",
        };
        setUserData(newUserData);
        setTempUserData(newUserData);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          // @ts-ignore
          console.error(
            "Error fetching user/profile:",
            // @ts-ignore
            error.response?.data || error
          );
          // @ts-ignore
          setError(
            typeof error.response === "object" &&
              error.response !== null &&
              "data" in error.response &&
              typeof (error.response as any).data === "object" &&
              (error.response as any).data !== null &&
              "detail" in (error.response as any).data
              ? (error.response as any).data.detail
              : "Failed to load profile data"
          );
        } else {
          console.error("Error fetching user/profile:", error);
          setError("Failed to load profile data");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserAndProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTempUserData({
      ...tempUserData,
      [name as keyof UserData]: value,
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setTempUserData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch("/api/v1/users/me/profile-details", {
        phone: tempUserData.phone,
        address: tempUserData.address,
      });
      console.log("Save response:", response.data);
      setUserData({ ...tempUserData });
      setIsEditing(false);
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        // @ts-ignore
        console.error("Error saving profile:", error.response?.data || error);
        // @ts-ignore
        let detail = "Unknown error";
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "detail" in error.response.data
        ) {
          // @ts-ignore
          detail = error.response.data.detail;
        }
        alert(`Error saving profile: ${detail}`);
      } else {
        console.error("Error saving profile:", error);
        alert("Error saving profile: Unknown error");
      }
    }
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
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="phone"
                              value={tempUserData.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          {isEditing ? (
                            <select
                              name="role"
                              value={tempUserData.role}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="Administrator">
                                Administrator
                              </option>
                            </select>
                          ) : (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {userData.role}
                              </span>
                            </div>
                          )}
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
                            status: "Last changed 30 days ago",
                            lastUpdated: "2025-04-05",
                            icon: (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            ),
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
                            <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                              {setting.title === "Password"
                                ? "Change"
                                : "Configure"}
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
    </div>
  );
}
