"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Dr. Hendra Wijaya",
    email: "hendra.wijaya@hospital.co.id",
    role: "Doctor",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    bio: "Pulmonologist with 8 years of experience in tuberculosis diagnosis and treatment. Specializing in early detection and treatment of respiratory diseases.",
    specialization: "Pulmonology",
    license: "IDI-12345678",
    hospital: "Jakarta General Hospital",
    department: "Respiratory Medicine",
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

  const [activityLog] = useState([
    {
      action: "Login",
      timestamp: "2025-05-05 08:23:15",
      details: "Successful login from 103.xx.xx.xx",
    },
    {
      action: "TB Prediction",
      timestamp: "2025-05-05 09:17:32",
      details: "Conducted TB prediction for patient ID: PAT-4567",
    },
    {
      action: "Updated Patient Record",
      timestamp: "2025-05-04 14:52:08",
      details: "Updated medical history for patient ID: PAT-3211",
    },
    {
      action: "Downloaded Report",
      timestamp: "2025-05-04 11:30:45",
      details: "Downloaded TB detection report for patient ID: PAT-8901",
    },
    {
      action: "Login",
      timestamp: "2025-05-04 08:10:22",
      details: "Successful login from 103.xx.xx.xx",
    },
  ]);

  // Sample data for charts
  const diagnosisData = [
    { name: "Jan", count: 12 },
    { name: "Feb", count: 19 },
    { name: "Mar", count: 15 },
    { name: "Apr", count: 22 },
    { name: "May", count: 28 },
  ];

  const patientData = [
    { name: "TB Positive", value: 35 },
    { name: "TB Negative", value: 65 },
  ];

  const COLORS = ["#0088FE", "#00C49F"];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">My Profile</h1>
                  {!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Info */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
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
                                <option value="Doctor">Doctor</option>
                                <option value="Nurse">Nurse</option>
                                <option value="Lab Technician">
                                  Lab Technician
                                </option>
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

                    <Card className="mt-6">
                      <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle>Professional Details</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specialization
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="specialization"
                                value={tempUserData.specialization}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            ) : (
                              <p className="text-gray-800">
                                {userData.specialization}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              License Number
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="license"
                                value={tempUserData.license}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            ) : (
                              <p className="text-gray-800">
                                {userData.license}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hospital
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="hospital"
                                value={tempUserData.hospital}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            ) : (
                              <p className="text-gray-800">
                                {userData.hospital}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="department"
                                value={tempUserData.department}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            ) : (
                              <p className="text-gray-800">
                                {userData.department}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Joined Date
                            </label>
                            <p className="text-gray-800">{userData.joinDate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mt-6">
                      <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>
                          Your activity statistics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="diagnosis">
                              Diagnosis
                            </TabsTrigger>
                            <TabsTrigger value="patients">Patients</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview">
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={diagnosisData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </TabsContent>
                          <TabsContent value="diagnosis">
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={diagnosisData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </TabsContent>
                          <TabsContent value="patients">
                            <div className="h-64 flex justify-center">
                              <ResponsiveContainer width="80%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={patientData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                      `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                  >
                                    {patientData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Sidebar */}
                  <div className="md:col-span-1">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <User className="h-12 w-12 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {userData.name}
                          </h3>
                          <p className="text-gray-500">{userData.role}</p>

                          <div className="mt-6 w-full space-y-2">
                            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                              Change Password
                            </button>
                            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                              Security Settings
                            </button>
                            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                              Notification Preferences
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mt-6">
                      <CardHeader className="bg-gray-50 border-b border-gray-100 py-3 px-4">
                        <CardTitle className="text-base">
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className="space-y-4">
                          {activityLog.map((log, index) => (
                            <li
                              key={index}
                              className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {log.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {log.timestamp}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {log.details}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
