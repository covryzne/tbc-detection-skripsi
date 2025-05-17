"use client";

import { SetStateAction, useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import { IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, parse } from "date-fns";
import Papa from "papaparse";

interface Detection {
  id: string;
  dateTime: string;
  result: string;
  confidence: string;
}

export default function RiwayatPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetections = async (forExport = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: forExport ? 1 : currentPage,
        limit: forExport ? undefined : itemsPerPage,
        export_all: forExport,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (
        dateRange === "custom" &&
        customDateRange.from &&
        customDateRange.to
      ) {
        params.date_from = format(customDateRange.from, "yyyy-MM-dd");
        params.date_to = format(customDateRange.to, "yyyy-MM-dd");
      } else if (dateRange === "today") {
        const today = new Date();
        params.date_from = format(today, "yyyy-MM-dd");
        params.date_to = format(today, "yyyy-MM-dd");
      } else if (dateRange === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        params.date_from = format(oneWeekAgo, "yyyy-MM-dd");
      } else if (dateRange === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        params.date_from = format(oneMonthAgo, "yyyy-MM-dd");
      }

      const response = await axios.get("/api/v1/patient-records/me", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      console.log("Detections response:", response.data);
      setDetections(response.data);
      setTotalItems(
        parseInt(response.headers["x-total-count"]) || response.data.length
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching detections:", error);
      const errorMessage = error.response?.data?.detail
        ? `Failed to load detection history: ${JSON.stringify(
            error.response.data.detail
          )}`
        : error.message || "Failed to load detection history";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [currentPage, searchTerm, statusFilter, dateRange, customDateRange]);

  const handleExport = async () => {
    try {
      const data = await fetchDetections(true);
      if (data.length === 0) {
        alert("No data to export!");
        return;
      }

      const csv = Papa.unparse({
        fields: ["ID", "Date & Time", "Detection Result", "Confidence"],
        data: data.map((item: Detection) => [
          item.id,
          item.dateTime,
          item.result,
          item.confidence,
        ]),
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `detection_history_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export data to CSV");
    }
  };

  const filteredDetections = detections.filter((detection) => {
    const matchesSearch = detection.result
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "positive" &&
        detection.result.toLowerCase() === "positive") ||
      (statusFilter === "negative" &&
        detection.result.toLowerCase() === "negative");

    let detectionDate: Date;
    try {
      detectionDate = parse(
        detection.dateTime,
        "MMM dd, yyyy HH:mm",
        new Date()
      );
    } catch (e) {
      console.error("Error parsing date:", detection.dateTime, e);
      return false;
    }
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDetections;

  const paginate = (pageNumber: SetStateAction<number>) =>
    setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">History Detection</h1>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <IconDownload className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-end my-4">
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
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
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
                  <option value="all">All Results</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
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
                      currentItems.map((detection) => {
                        let formattedDateTime = detection.dateTime;
                        try {
                          const parsedDate = parse(
                            detection.dateTime,
                            "MMM dd, yyyy HH:mm",
                            new Date()
                          );
                          formattedDateTime = format(
                            parsedDate,
                            "MMM dd, yyyy HH:mm"
                          );
                        } catch (e) {
                          console.error(
                            "Error formatting date:",
                            detection.dateTime
                          );
                        }
                        return (
                          <tr key={detection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formattedDateTime}
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
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No prediction history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
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
                      Previous
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
                      Next
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
