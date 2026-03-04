"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url } = await uploadRes.json();

      // Update the user's profileImage in the database
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: url }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      const updatedUser = await updateRes.json();
      setProfile(updatedUser);

      // Update the NextAuth session so Navbar reflects the new image
      await update({ image: url });

      setMessage({ text: "Profile picture updated successfully!", type: "success" });
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ text: "Failed to update profile picture", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-gray-200 rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-56" />
          </div>
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h1>

      {/* Messages */}
      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profile?.profileImage ? (
              <Image
                src={profile.profileImage}
                alt={profile.name || "Admin"}
                width={112}
                height={112}
                className="rounded-full object-cover w-28 h-28 border-4 border-gray-100"
              />
            ) : (
              <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-gray-100">
                <span className="text-indigo-600 font-bold text-4xl">
                  {profile?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            )}
            {/* Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{profile?.name}</h3>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400"
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
            <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Role</p>
            <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium capitalize">
              {profile?.role}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-sm font-medium text-gray-900">{profile?.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-sm font-medium text-gray-900">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Address */}
      {profile?.address && (profile.address.street || profile.address.city) && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="space-y-1">
            {profile.address.street && (
              <p className="text-sm text-gray-900">{profile.address.street}</p>
            )}
            <p className="text-sm text-gray-600">
              {[profile.address.city, profile.address.state, profile.address.zipCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            {profile.address.country && (
              <p className="text-sm text-gray-600">{profile.address.country}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
