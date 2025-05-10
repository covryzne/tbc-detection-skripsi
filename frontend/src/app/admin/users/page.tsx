"use client";

import * as React from "react";
import {
  IconSearch,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconTrash,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  createdAt: string;
  region: string;
  email: string;
  status: "active" | "inactive";
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: User) => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

// Sample users data
const initialUsersData: User[] = [
  {
    id: "USR001",
    name: "John Doe",
    createdAt: "2025-04-15T08:30:00",
    region: "Jakarta",
    email: "john.doe@example.com",
    status: "active",
  },
  {
    id: "USR002",
    name: "Sarah Johnson",
    createdAt: "2025-04-12T14:45:00",
    region: "Surabaya",
    email: "sarah.j@example.com",
    status: "active",
  },
  {
    id: "USR003",
    name: "Ahmad Rizki",
    createdAt: "2025-04-10T09:15:00",
    region: "Bandung",
    email: "ahmad.r@example.com",
    status: "active",
  },
  {
    id: "USR004",
    name: "Maria Sanjaya",
    createdAt: "2025-04-08T16:20:00",
    region: "Yogyakarta",
    email: "maria.s@example.com",
    status: "inactive",
  },
  {
    id: "USR005",
    name: "Robert Chen",
    createdAt: "2025-04-05T11:10:00",
    region: "Medan",
    email: "robert.c@example.com",
    status: "active",
  },
  {
    id: "USR006",
    name: "Anita Wijaya",
    createdAt: "2025-04-03T13:25:00",
    region: "Makassar",
    email: "anita.w@example.com",
    status: "active",
  },
  {
    id: "USR007",
    name: "David Wong",
    createdAt: "2025-04-01T10:40:00",
    region: "Jakarta",
    email: "david.w@example.com",
    status: "inactive",
  },
  {
    id: "USR008",
    name: "Eka Putra",
    createdAt: "2025-03-29T15:55:00",
    region: "Bali",
    email: "eka.p@example.com",
    status: "active",
  },
];

// User Modal Component
const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [userData, setUserData] = React.useState<User>(
    user || {
      id: "",
      name: "",
      email: "",
      region: "",
      status: "active",
      createdAt: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate an ID if it's a new user
    if (!userData.id) {
      const newUser = {
        ...userData,
        id: `USR${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      onSave(newUser);
    } else {
      onSave(userData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {user && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userData.id}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              name="region"
              value={userData.region}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Region</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Medan">Medan</option>
              <option value="Makassar">Makassar</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Bali">Bali</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={userData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirm Dialog Component
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersContent: React.FC = () => {
  const [usersData, setUsersData] = React.useState<User[]>(initialUsersData);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const itemsPerPage = 5;

  // CRUD Operations
  const deleteUser = (userId: string) => {
    setUsersData(usersData.filter((user) => user.id !== userId));
  };

  const addUser = (newUser: User) => {
    setUsersData([...usersData, newUser]);
  };

  const updateUser = (userId: string, updatedData: Partial<User>) => {
    setUsersData(
      usersData.map((user) =>
        user.id === userId ? { ...user, ...updatedData } : user
      )
    );
  };

  // Filter users based on search term
  const filteredUsers = usersData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Format date
  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: User) => {
    if (editingUser) {
      updateUser(userData.id, userData);
    } else {
      addUser(userData);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Users Management</h1>

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="relative w-full md:w-64">
                <IconSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
                  <IconFilter size={18} />
                  <span>Filter</span>
                </button>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors"
                >
                  <IconPlus size={18} />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Full Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Region
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleEdit(user)}
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(user)}
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <IconChevronLeft size={18} />
                </button>
                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`w-10 h-10 rounded-md ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))
                ) : (
                  <>
                    {currentPage > 2 && (
                      <button
                        className="w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-300"
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                    )}

                    {currentPage > 3 && (
                      <span className="flex items-center justify-center w-10 h-10">
                        ...
                      </span>
                    )}

                    {currentPage > 1 && (
                      <button
                        className="w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-300"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </button>
                    )}

                    <button className="w-10 h-10 rounded-md bg-blue-500 text-white">
                      {currentPage}
                    </button>

                    {currentPage < totalPages && (
                      <button
                        className="w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-300"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </button>
                    )}

                    {currentPage < totalPages - 2 && (
                      <span className="flex items-center justify-center w-10 h-10">
                        ...
                      </span>
                    )}

                    {currentPage < totalPages - 1 && (
                      <button
                        className="w-10 h-10 rounded-md bg-white text-gray-700 border border-gray-300"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}
                <button
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* User Modal */}
            <UserModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              user={editingUser}
              onSave={handleSaveUser}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
              isOpen={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              onConfirm={confirmDelete}
              title="Delete User"
              message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  return <UsersContent />;
}
