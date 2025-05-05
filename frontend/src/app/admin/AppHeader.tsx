"use client";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

export default function AppHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow px-6 h-16 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">Dashboard Admin</h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <FaUserCircle className="text-gray-600" size={24} />
          <span className="text-sm font-medium text-primary">Admin</span>
          <FaChevronDown size={14} className="text-gray-500" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow z-50 border text-sm">
            <a
              href="/profile"
              className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            >
              Edit Profil
            </a>
            <button
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              onClick={() => console.log("Logout")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
