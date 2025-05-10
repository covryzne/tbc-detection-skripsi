"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Calendar,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Hendra Wijaya",
    email: "hendra.wijaya@hospital.co.id",
    role: "Administrator",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    bio: "System administrator with 6 years of experience in healthcare IT. Responsible for managing the TB detection system and user access control.",
    joinDate: "2022-03-15",
  });

  const [tempUserData, setTempUserData] = useState({ ...userData });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setTempUserData({
      ...tempUserData,
      [name]: value,
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setTempUserData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setUserData({ ...tempUserData });
    setIsEditing(false);
  };

  const activityLog = [
    {
      action: "Login",
      timestamp: "2025-05-05 08:23:15",
      details: "Successful login from 103.xx.xx.xx",
    },
    {
      action: "User Management",
      timestamp: "2025-05-05 09:17:32",
      details: "Added new user account: dr.sarah@hospital.co.id",
    },
    {
      action: "System Update",
      timestamp: "2025-05-04 14:52:08",
      details: "Applied security patch to TB detection module",
    },
    {
      action: "Access Control",
      timestamp: "2025-05-04 11:30:45",
      details: "Modified permissions for Laboratory department",
    },
    {
      action: "Login",
      timestamp: "2025-05-04 08:10:22",
      details: "Successful login from 103.xx.xx.xx",
    },
  ];

  const securitySettings = [
    {
      title: "Password",
      status: "Last changed 30 days ago",
      lastUpdated: "2025-04-05",
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Profile Banner */}
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
                  {/* Row 1: Profile Card */}
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
                                {userData.phone}
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
                              <option value="System Admin">System Admin</option>
                              <option value="Super Admin">Super Admin</option>
                              <option value="IT Support">IT Support</option>
                            </select>
                          ) : (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {userData.role}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2">
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
                                {userData.address}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          {isEditing ? (
                            <textarea
                              name="bio"
                              value={tempUserData.bio}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          ) : (
                            <p className="text-gray-800">{userData.bio}</p>
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
                        {securitySettings.map((setting, index) => (
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
                    <CardFooter className="bg-gray-50 border-t border-gray-100 flex-col items-start gap-2">
                      <div className="text-sm text-gray-600">
                        <strong>Note:</strong> For security reasons, some
                        actions may require additional verification.
                      </div>
                      <div className="text-xs text-gray-500">
                        Last security audit: April 28, 2025
                      </div>
                    </CardFooter>
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
