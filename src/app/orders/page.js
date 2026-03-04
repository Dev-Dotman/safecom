"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import OrderQRCode from "@/components/OrderQRCode";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchOrders();
    }
  }, [authStatus]);

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

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign in to view orders
        </h1>
        <Link
          href="/auth/signin"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg font-medium text-gray-900">No orders yet</p>
          <p className="text-gray-500 mt-1 mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                  {order.status === "pending" && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>
                    Deliver to: {order.deliveryAddress.street},{" "}
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </p>
                </div>
                <span className="font-bold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>

              {/* QR Code for rider verification */}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex items-start gap-4">
                    <OrderQRCode order={order} />
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-medium text-gray-900">Delivery QR Code</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your delivery rider can scan this QR code to verify the
                        order details match before handing over your package.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
