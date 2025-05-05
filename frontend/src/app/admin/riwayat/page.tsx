"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Search, Calendar, Filter, Download, Eye } from "lucide-react";

export default function RiwayatPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [detections] = useState([
    {
      id: "DET-7829",
      user: "Budi Santoso",
      userId: "USR-1234",
      result: "Positive",
      date: "2025-05-04",
      time: "14:23",
      confidence: "92%",
      reviewed: true,
      notes: "Follow-up recommended",
    },
    {
      id: "DET-7828",
      user: "Anisa Wijaya",
      userId: "USR-2456",
      result: "Negative",
      date: "2025-05-04",
      time: "11:05",
      confidence: "97%",
      reviewed: true,
      notes: "No abnormalities detected",
    },
    {
      id: "DET-7827",
      user: "Rizky Pratama",
      userId: "USR-3789",
      result: "Positive",
      date: "2025-05-03",
      time: "16:42",
      confidence: "89%",
      reviewed: false,
      notes: "Potential TB indications",
    },
    {
      id: "DET-7826",
      user: "Diana Putri",
      userId: "USR-4321",
      result: "Negative",
      date: "2025-05-03",
      time: "09:17",
      confidence: "95%",
      reviewed: true,
      notes: "Clear lungs",
    },
    {
      id: "DET-7825",
      user: "Farhan Ahmad",
      userId: "USR-5678",
      result: "Positive",
      date: "2025-05-02",
      time: "15:31",
      confidence: "91%",
      reviewed: false,
      notes: "Multiple areas of concern",
    },
    {
      id: "DET-7824",
      user: "Siti Rahayu",
      userId: "USR-6789",
      result: "Positive",
      date: "2025-05-02",
      time: "10:58",
      confidence: "87%",
      reviewed: true,
      notes: "Referred to specialist",
    },
    {
      id: "DET-7823",
      user: "Joko Widodo",
      userId: "USR-7890",
      result: "Negative",
      date: "2025-05-01",
      time: "14:05",
      confidence: "96%",
      reviewed: true,
      notes: "Regular check-up",
    },
    {
      id: "DET-7822",
      user: "Maya Sari",
      userId: "USR-8901",
      result: "Negative",
      date: "2025-05-01",
      time: "09:43",
      confidence: "94%",
      reviewed: true,
      notes: "Annual screening",
    },
  ]);

  const filteredDetections = detections.filter((detection) => {
    // Filter by search term
    const matchesSearch =
      detection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.userId.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "positive" && detection.result === "Positive") ||
      (statusFilter === "negative" && detection.result === "Negative");

    // Filter by date range
    // In a real app, you would use actual date filtering logic
    const matchesDate = dateRange === "all"; // Simplifying for this example

    return matchesSearch && matchesStatus && matchesDate;
  });

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
                  <h1 className="text-2xl font-bold">Riwayat Deteksi</h1>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="Cari berdasarkan ID, pengguna, atau ID pasien"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <select
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value="all">Semua Waktu</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="custom">Rentang Kustom</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Filter className="h-5 w-5 text-gray-400" />
                      <select
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Hasil</option>
                        <option value="positive">Positif</option>
                        <option value="negative">Negatif</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pengguna
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID Pasien
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hasil
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal & Waktu
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kepercayaan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ditinjau
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catatan
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDetections.map((detection, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {detection.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detection.user}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detection.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  detection.result === "Positive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {detection.result}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detection.date}{" "}
                              <span className="text-gray-400">pukul</span>{" "}
                              {detection.time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detection.confidence}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  detection.reviewed
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {detection.reviewed ? "Ya" : "Tertunda"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detection.notes}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                                <Eye className="h-5 w-5 mr-1" />
                                Lihat
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Menampilkan{" "}
                      <span className="font-medium">
                        {filteredDetections.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium">{detections.length}</span>{" "}
                      hasil
                    </div>
                    <div className="flex-1 flex justify-end">
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Sebelumnya
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          2
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          3
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Berikutnya
                        </a>
                      </nav>
                    </div>
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
