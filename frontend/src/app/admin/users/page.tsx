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
} from "@tabler/icons-react";

// Interface untuk data user di tabel
interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  createdAt: string;
}

// Interface untuk form (tambah/edit user)
interface UserForm extends User {
  password?: string; // Optional, cuma buat create user
}

const UserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: UserForm) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = React.useState<UserForm>(
    user
      ? { ...user, password: "" }
      : {
          id: "",
          name: "",
          email: "",
          region: "Tidak diketahui",
          createdAt: "",
          password: "",
        }
  );

  // Reset formData saat user berubah
  React.useEffect(() => {
    console.log("UserModal received user:", user); // Debug
    setFormData(
      user
        ? { ...user, password: "" }
        : {
            id: "",
            name: "",
            email: "",
            region: "Tidak diketahui",
            createdAt: "",
            password: "",
          }
    );
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting formData:", formData); // Debug
    if (!formData.id && user) {
      console.error("FormData missing id on submit:", formData);
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
            {user ? "Edit User" : "Tambah User"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nama Lengkap
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
              />
            </div>
            {!user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Simpan
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
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Hapus
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

  // Fetch users dari backend
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("Tidak ada token autentikasi. Silakan login ulang.");
        }
        const response = await fetch("http://localhost:8000/api/v1/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Gagal mengambil data user");
        }
        const data = await response.json();
        console.log("API response:", data); // Debug response
        setUsersData(
          data.map((user: any) => ({
            id: user.id,
            name: user.full_name,
            email: user.email,
            region: user.region || "Tidak diketahui",
            createdAt: user.created_at,
          }))
        );
      } catch (err: any) {
        setError("Gagal memuat data user: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Format tanggal
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  // Potong User ID sebelum '-'
  const formatUserId = (id: string) => {
    return id.split("-")[0];
  };

  // Filter user
  const filteredUsers = usersData.filter(
    (user) =>
      !user.email.startsWith("temp_") &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Hitung pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (user: User) => {
    console.log("Editing user:", user); // Debug
    if (!user.id) {
      console.error("Invalid user ID in handleEdit:", user);
      setError("Gagal mengedit: ID user tidak valid.");
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
      setError("Gagal menyimpan: ID user tidak ditemukan.");
      return;
    }
    if (editingUser) {
      updateUser(editingUser.id, userData); // Pakai editingUser.id
    } else {
      addUser(userData);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
    }
  };

  const addUser = async (newUser: UserForm) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Tidak ada token autentikasi. Silakan login ulang.");
      }
      if (!newUser.email.includes("@")) {
        throw new Error("Email tidak valid.");
      }
      if (newUser.password && newUser.password.length < 6) {
        throw new Error("Password harus minimal 6 karakter.");
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
          throw new Error("Email sudah terdaftar. Gunakan email lain.");
        }
        throw new Error(errorData.detail || "Gagal menambah user");
      }
      const data = await response.json();
      setUsersData([
        ...usersData,
        {
          id: data.id,
          name: data.full_name,
          email: data.email,
          region: data.region || "Tidak diketahui",
          createdAt: data.created_at,
        },
      ]);
      setError(null);
    } catch (error: any) {
      console.error("Add user error:", error);
      setError(
        error.message || "Gagal menambah user. Silakan cek data dan coba lagi."
      );
    }
  };

  const updateUser = async (userId: string, updatedData: UserForm) => {
    console.log("Updating user:", { userId, updatedData }); // Debug
    try {
      if (!userId) {
        throw new Error("ID user tidak valid.");
      }
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Tidak ada token autentikasi. Silakan login ulang.");
      }
      if (!updatedData.email.includes("@")) {
        throw new Error("Email tidak valid.");
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
        throw new Error(errorData.detail || "Gagal mengupdate user");
      }
      const data = await response.json();
      setUsersData(
        usersData.map((user) =>
          user.id === userId
            ? {
                ...user,
                name: data.full_name,
                email: data.email,
                region: data.region || "Tidak diketahui",
                createdAt: data.created_at,
              }
            : user
        )
      );
      setError(null);
    } catch (error: any) {
      console.error("Update user error:", error);
      setError(
        error.message ||
          "Gagal mengupdate user. Silakan cek data dan coba lagi."
      );
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Tidak ada token autentikasi. Silakan login ulang.");
      }
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Gagal menghapus user");
      }
      setUsersData(usersData.filter((user) => user.id !== userId));
      setError(null);
    } catch (error: any) {
      console.error("Delete user error:", error);
      setError(
        error.message || "Gagal menghapus user. Silakan cek data dan coba lagi."
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Users Management</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-10">Memuat...</div>
            ) : (
              <>
                {/* Search dan Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="relative w-full md:w-64">
                    <IconSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Cari user..."
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
                      <span>Tambah User</span>
                    </button>
                  </div>
                </div>

                {/* Tabel User */}
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
                          Nama Lengkap
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
                          Dibuat Pada
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Aksi
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
                    Menampilkan {indexOfFirstItem + 1} sampai{" "}
                    {Math.min(indexOfLastItem, filteredUsers.length)} dari{" "}
                    {filteredUsers.length} user
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
                  title="Hapus User"
                  message={`Apakah Anda yakin ingin menghapus ${userToDelete?.name}? Aksi ini tidak dapat dibatalkan.`}
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
