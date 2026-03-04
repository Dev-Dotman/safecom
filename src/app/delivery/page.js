"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const pending = orders.filter(
    (o) => o.status === "confirmed" || o.status === "shipped"
  );
  const inTransit = orders.filter((o) => o.status === "out_for_delivery");
  const delivered = orders.filter((o) => o.status === "delivered");
  const totalEarnings = delivered.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);
  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here&apos;s your delivery overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
          <p className="text-sm text-gray-500">Pending Pickup</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{inTransit.length}</p>
          <p className="text-sm text-gray-500">In Transit</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{delivered.length}</p>
          <p className="text-sm text-gray-500">Delivered</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Est. Earnings</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Active Deliveries</h2>
          <Link
            href="/delivery/orders"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No active deliveries right now</p>
            <p className="text-gray-400 text-xs mt-1">New orders will appear here when assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.status === "out_for_delivery" 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">
                    ${order.totalAmount?.toFixed(2)}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    order.status === "out_for_delivery"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed */}
      {delivered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Completed</h2>
          <div className="space-y-3">
            {delivered.slice(0, 3).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">
                    ${order.totalAmount?.toFixed(2)}
                  </p>
                  <span className="text-xs font-medium text-green-600">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
