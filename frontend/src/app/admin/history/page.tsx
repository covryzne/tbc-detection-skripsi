"use client";

import { SetStateAction, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Search, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface HistoryRecord {
  id: string;
  patient_id: string;
  date: string;
  image_path: string | null;
  result: string;
  confidence: string | null;
  inference_time: string | null;
  patient_name: string;
  patient_age: number | null;
  patient_gender: string | null;
  patient_phone: string | null;
  patient_address: string | null;
}

export default function RiwayatPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("/api/v1/patient/records", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setLoading(false);
        router.push("/login");
      }
    };

    fetchHistory();
  }, [router]);

  const filteredDetections = history.filter((detection) => {
    const matchesSearch =
      detection.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (detection.patient_address &&
        detection.patient_address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "positive" &&
        detection.result.toLowerCase() === "positive") ||
      (statusFilter === "negative" &&
        detection.result.toLowerCase() === "negative");

    const detectionDate = new Date(detection.date);
    const now = new Date();
    let matchesDate = true;

    if (dateRange === "today") {
      matchesDate = detectionDate.toDateString() === now.toDateString();
    } else if (dateRange === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      matchesDate = detectionDate >= oneWeekAgo;
    } else if (dateRange === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      matchesDate = detectionDate >= oneMonthAgo;
    } else if (
      dateRange === "custom" &&
      customDateRange.from &&
      customDateRange.to
    ) {
      matchesDate =
        detectionDate >= customDateRange.from &&
        detectionDate <= customDateRange.to;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredDetections.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDetections.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: SetStateAction<number>) =>
    setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const formatConfidence = (confidence: string | null): string => {
    if (!confidence || confidence.trim() === "") {
      console.log("Confidence is null or empty:", confidence);
      return "-";
    }
    const cleaned = confidence.replace("%", "").trim();
    let value = parseFloat(cleaned);

    if (isNaN(value)) {
      console.log("Invalid confidence value:", confidence);
      return "-";
    }
    const percentage = value > 1 ? value : value * 100;
    const formatted = percentage.toFixed(2);
    const isInteger = percentage % 1 === 0;
    console.log(
      `Confidence input: ${confidence}, parsed: ${value}, output: ${
        isInteger ? percentage : formatted
      }%`
    );

    return isInteger ? `${percentage}%` : `${formatted}%`;
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">History Detection</h1>
            </div>

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
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      if (e.target.value !== "custom") {
                        setCustomDateRange({ from: undefined, to: undefined });
                      }
                    }}
                  >
                    <option value="all">Semua Waktu</option>
                    <option value="today">Hari Ini</option>
                    <option value="week">Minggu Ini</option>
                    <option value="month">Bulan Ini</option>
                    <option value="custom">Rentang Kustom</option>
                  </select>
                  {dateRange === "custom" && (
                    <DateRangePicker
                      value={customDateRange}
                      onChange={setCustomDateRange}
                    />
                  )}
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
                        Age
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
                    {currentItems.length > 0 ? (
                      currentItems.map((detection) => (
                        <tr key={detection.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {detection.patient_id.toUpperCase().includes("-")
                              ? detection.patient_id
                                  .toUpperCase()
                                  .split("-")[0]
                                  .slice(0, 9)
                              : detection.patient_id.toUpperCase().slice(0, 9)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {detection.patient_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {detection.patient_age || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(detection.date).toLocaleString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {detection.patient_address || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                detection.result.toLowerCase() === "positive"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {detection.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatConfidence(detection.confidence)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Tidak ada riwayat prediksi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {indexOfLastItem + 1}-
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
