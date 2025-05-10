"use client";

import { SetStateAction, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Search, Calendar, Filter, Download } from "lucide-react";
import { IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function RiwayatPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [detections] = useState([
    {
      userId: "U001",
      user: "Ahmad Fauzi",
      dateTime: "May 5, 2025 09:25",
      region: "Jakarta",
      result: "Positive",
      confidence: "97.8%",
    },
    {
      userId: "U002",
      user: "Budi Santoso",
      dateTime: "May 5, 2025 08:42",
      region: "Bandung",
      result: "Negative",
      confidence: "95.2%",
    },
    {
      userId: "U003",
      user: "Siti Rahayu",
      dateTime: "May 4, 2025 16:12",
      region: "Surabaya",
      result: "Positive",
      confidence: "94.5%",
    },
    {
      userId: "U004",
      user: "Dewi Lestari",
      dateTime: "May 4, 2025 14:30",
      region: "Medan",
      result: "Negative",
      confidence: "98.1%",
    },
    {
      userId: "U005",
      user: "Hendra Wijaya",
      dateTime: "May 4, 2025 11:18",
      region: "Makassar",
      result: "Negative",
      confidence: "96.3%",
    },
    {
      userId: "U006",
      user: "Rina Andriani",
      dateTime: "May 3, 2025 10:45",
      region: "Yogyakarta",
      result: "Positive",
      confidence: "93.7%",
    },
    {
      userId: "U007",
      user: "Agus Purnomo",
      dateTime: "May 3, 2025 09:15",
      region: "Surabaya",
      result: "Negative",
      confidence: "97.5%",
    },
    {
      userId: "U008",
      user: "Diana Putri",
      dateTime: "May 3, 2025 08:30",
      region: "Jakarta",
      result: "Positive",
      confidence: "96.2%",
    },
    {
      userId: "U009",
      user: "Farhan Ahmad",
      dateTime: "May 2, 2025 16:45",
      region: "Bandung",
      result: "Negative",
      confidence: "95.8%",
    },
    {
      userId: "U010",
      user: "Maya Sari",
      dateTime: "May 2, 2025 14:20",
      region: "Medan",
      result: "Positive",
      confidence: "94.3%",
    },
    {
      userId: "U011",
      user: "Rizky Pratama",
      dateTime: "May 2, 2025 11:05",
      region: "Makassar",
      result: "Negative",
      confidence: "98.4%",
    },
    {
      userId: "U012",
      user: "Anisa Wijaya",
      dateTime: "May 1, 2025 15:30",
      region: "Yogyakarta",
      result: "Positive",
      confidence: "92.9%",
    },
  ]);

  const filteredDetections = detections.filter((detection) => {
    // Filter by search term
    const matchesSearch =
      detection.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.region.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredDetections.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDetections.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber: SetStateAction<number>) =>
    setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">History Detection</h1>
              <Button variant="outline" size="sm">
                <IconDownload className="h-4 w-4 mr-1" />
                Export
              </Button>
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
                      placeholder="Cari berdasarkan ID, pengguna, atau wilayah"
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
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detection Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((detection, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {detection.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detection.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detection.dateTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detection.region}
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
                          {detection.confidence}
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
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, filteredDetections.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium">
                    {filteredDetections.length}
                  </span>{" "}
                  hasil
                </div>
                <div className="flex-1 flex justify-end">
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>

                    {[...Array(totalPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === number + 1
                            ? "bg-blue-50 text-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Berikutnya
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
