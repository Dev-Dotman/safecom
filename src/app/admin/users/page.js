"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    delivery: "bg-blue-100 text-blue-700",
    user: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        User Management
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  User
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Phone
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.phone || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        roleColors[user.role]
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
