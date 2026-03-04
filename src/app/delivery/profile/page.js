"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function DeliveryProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, delivered: 0, active: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          const orderList = Array.isArray(orders) ? orders : [];
          setStats({
            total: orderList.length,
            delivered: orderList.filter((o) => o.status === "delivered").length,
            active: orderList.filter(
              (o) => !["delivered", "cancelled"].includes(o.status)
            ).length,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-56" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const user = profile || session?.user;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your rider information and delivery stats
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user?.profileImage || user?.image ? (
              <Image
                src={user.profileImage || user.image}
                alt={user.name || "Profile"}
                width={80}
                height={80}
                className="rounded-full object-cover w-20 h-20"
              />
            ) : (
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || "R"}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified Rider
              </span>
              {profile?.vehicleType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  {profile.vehicleType}
                </span>
              )}
              {profile?.licensePlate && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  Plate: {profile.licensePlate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-sm text-gray-500 mt-1">Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
          <p className="text-sm text-gray-500 mt-1">Active</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-gray-900">
                {profile?.phone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
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
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address
          </h3>
          {profile?.address && (profile.address.street || profile.address.city) ? (
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
          ) : (
            <p className="text-sm text-gray-400">No address on file</p>
          )}
        </div>
      </div>
    </div>
  );
}
