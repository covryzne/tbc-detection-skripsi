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
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { toast } from "sonner";

// Interface for user data in table
interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  createdAt: string;
}

// Interface for form (add/edit user)
interface UserForm extends User {
  password?: string; // Optional, only for creating user
  confirmPassword?: string; // For password confirmation
}

const UserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: UserForm) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = React.useState<UserForm>(
    user
      ? { ...user, password: "", confirmPassword: "" }
      : {
          id: "",
          name: "",
          email: "",
          region: "Unknown",
          createdAt: "",
          password: "",
          confirmPassword: "",
        }
  );

  // State for controlling password editing when editing user
  const [showPasswordEdit, setShowPasswordEdit] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  // Reset formData when user changes
  React.useEffect(() => {
    console.log("UserModal received user:", user); // Debug
    setFormData(
      user
        ? { ...user, password: "", confirmPassword: "" }
        : {
            id: "",
            name: "",
            email: "",
            region: "Unknown",
            createdAt: "",
            password: "",
            confirmPassword: "",
          }
    );
    setShowPasswordEdit(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [user]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting formData:", formData); // Debug

    if (!formData.id && user) {
      console.error("FormData missing id on submit:", formData);
      return;
    } // Validate password for new users
    if (!user && (!formData.password || formData.password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Validate password confirmation for new users or when editing password
    if (
      (!user || showPasswordEdit) &&
      formData.password !== formData.confirmPassword
    ) {
      toast.error("Password and confirm password do not match");
      return;
    }

    // Validate password length when editing
    if (
      user &&
      showPasswordEdit &&
      formData.password &&
      formData.password.length < 6
    ) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {user ? "Edit User" : "Add User"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />{" "}
            </div>

            {/* Password Section */}
            {!user && (
              <>
                {/* New User Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 pr-10"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <IconEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 pr-10"
                      required
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <IconEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Edit User Password Section */}
            {user && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordEdit(!showPasswordEdit);
                      if (!showPasswordEdit) {
                        setFormData({
                          ...formData,
                          password: "",
                          confirmPassword: "",
                        });
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPasswordEdit
                      ? "Cancel Edit Password"
                      : "Edit Password"}
                  </button>
                </div>

                {!showPasswordEdit ? (
                  <input
                    type="password"
                    value="••••••••"
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                  />
                ) : (
                  <>
                    {/* New Password */}
                    <div className="mb-3">
                      {" "}
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-md p-2 pr-10"
                          minLength={6}
                          placeholder="Minimum 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <IconEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <IconEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-3">
                      {" "}
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-md p-2 pr-10"
                          placeholder="Repeat new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <IconEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <IconEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );
};

const UsersContent: React.FC = () => {
  const [usersData, setUsersData] = React.useState<User[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const itemsPerPage = 5;

  // Fetch users from backend
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }
        const response = await fetch("http://localhost:8000/api/v1/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch user data");
        }
        const data = await response.json();
        console.log("API response:", data); // Debug response
        setUsersData(
          data.map((user: any) => ({
            id: user.id,
            name: user.full_name,
            email: user.email,
            region: user.region || "Unknown",
            createdAt: user.created_at,
          }))
        );
      } catch (err: any) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Truncate User ID before '-' and convert to uppercase
  const formatUserId = (id: string) => {
    return id.toUpperCase().split("-")[0];
  };

  // Filter users
  const filteredUsers = usersData.filter(
    (user) =>
      !user.email.startsWith("temp_") &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (user: User) => {
    console.log("Editing user:", user); // Debug
    if (!user.id) {
      console.error("Invalid user ID in handleEdit:", user);
      setError("Failed to edit: Invalid user ID.");
      return;
    }
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

  const handleSaveUser = (userData: UserForm) => {
    console.log("Saving user:", userData); // Debug
    if (editingUser && !userData.id) {
      console.error("No userId provided for update:", userData);
      setError("Failed to save: User ID not found.");
      return;
    }
    if (editingUser) {
      updateUser(editingUser.id, userData); // Use editingUser.id
    } else {
      addUser(userData);
    }
  };
  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setIsConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const addUser = async (newUser: UserForm) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      if (!newUser.email.includes("@")) {
        throw new Error("Invalid email address.");
      }
      if (newUser.password && newUser.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      const response = await fetch("http://localhost:8000/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          confirm_password: newUser.password,
          is_active: true,
          is_admin: false,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (
          response.status === 400 &&
          errorData.detail.includes("Email sudah digunakan")
        ) {
          throw new Error(
            "Email already registered. Please use a different email."
          );
        }
        throw new Error(errorData.detail || "Failed to add user");
      }
      const data = await response.json();
      setUsersData([
        ...usersData,
        {
          id: data.id,
          name: data.full_name,
          email: data.email,
          region: data.region || "Unknown",
          createdAt: data.created_at,
        },
      ]);
      setError(null);
      toast.success("User successfully added!", {
        description: `${data.full_name} has been added to the system.`,
      });
    } catch (error: any) {
      console.error("Add user error:", error);
      setError(
        error.message ||
          "Failed to add user. Please check the data and try again."
      );
    }
  };

  const updateUser = async (userId: string, updatedData: UserForm) => {
    console.log("Updating user:", { userId, updatedData }); // Debug
    try {
      if (!userId) {
        throw new Error("Invalid user ID.");
      }
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      if (!updatedData.email.includes("@")) {
        throw new Error("Invalid email address.");
      }
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: updatedData.name,
            email: updatedData.email,
            password: updatedData.password || "dummy",
            confirm_password: updatedData.password || "dummy",
            is_active: true,
            is_admin: false,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update user");
      }
      const data = await response.json();
      setUsersData(
        usersData.map((user) =>
          user.id === userId
            ? {
                ...user,
                name: data.full_name,
                email: data.email,
                region: data.region || "Unknown",
                createdAt: data.created_at,
              }
            : user
        )
      );
      setError(null);
      toast.success("User successfully updated!", {
        description: `${data.full_name} data has been updated.`,
      });
    } catch (error: any) {
      console.error("Update user error:", error);
      setError(
        error.message ||
          "Failed to update user. Please check the data and try again."
      );
    }
  };
  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Since there's no DELETE endpoint, we'll use soft delete by setting is_active to false
      const userToDelete = usersData.find((user) => user.id === userId);
      if (!userToDelete) {
        throw new Error("User not found.");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: userToDelete.name,
            email: userToDelete.email,
            password: "dummy", // Required by backend but won't be changed
            confirm_password: "dummy",
            is_active: false, // Soft delete - set to inactive
            is_admin: false,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete user");
      }

      // Remove from frontend list (acts like hard delete for UI purposes)
      setUsersData(usersData.filter((user) => user.id !== userId));
      setError(null);
      toast.success("User successfully deleted!", {
        description: "User has been deactivated from the system.",
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
      setError(
        error.message ||
          "Failed to delete user. Please check the data and try again."
      );
      toast.error("Failed to delete user", {
        description:
          error.message || "An error occurred while deleting the user.",
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <>
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
                    <button
                      onClick={handleAddNew}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors"
                    >
                      <IconPlus size={18} />
                      <span>Add User</span>
                    </button>
                  </div>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ID
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
                          Joined At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatUserId(user.id)}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  return <UsersContent />;
}
