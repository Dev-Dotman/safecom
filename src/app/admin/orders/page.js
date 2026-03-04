"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = [
  "pending",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setDeliveryPersons(
        Array.isArray(data) ? data.filter((u) => u.role === "delivery") : []
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Orders Management
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {order.user?.profileImage ? (
                    <Image
                      src={order.user.profileImage}
                      alt={order.user.name || "Customer"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                      {order.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                  <p className="font-medium text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    by {order.user?.name || "Unknown"} ({order.user?.email})
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ₦{order.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-600">
                      ₦{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Deliver to:</span>{" "}
                {order.deliveryAddress.fullName},{" "}
                {order.deliveryAddress.street},{" "}
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.state}{" "}
                {order.deliveryAddress.zipCode},{" "}
                {order.deliveryAddress.country} |{" "}
                Tel: {order.deliveryAddress.phone}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    Status:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrder(order._id, { status: e.target.value })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ").replace(/\b\w/g, (l) =>
                          l.toUpperCase()
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    Assign Delivery:
                  </label>
                  <select
                    value={order.deliveryPerson?._id || ""}
                    onChange={(e) =>
                      updateOrder(order._id, {
                        deliveryPerson: e.target.value || null,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {deliveryPersons.map((dp) => (
                      <option key={dp._id} value={dp._id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
