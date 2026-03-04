"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Image from "next/image";

const QRScannerModal = lazy(() => import("@/components/QRScannerModal"));

const statusConfig = {
  pending: { color: "bg-gray-100 text-gray-700", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-700", label: "Confirmed" },
  shipped: { color: "bg-purple-100 text-purple-700", label: "Shipped" },
  out_for_delivery: { color: "bg-orange-100 text-orange-700", label: "Out for Delivery" },
  delivered: { color: "bg-green-100 text-green-700", label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [verifyState, setVerifyState] = useState({}); // { orderId: { loading, code, expiresAt, error } }
  const [scanOrderId, setScanOrderId] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null); // orderId or null

  useEffect(() => {
    fetchOrders();
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

  const sendVerification = async (orderId) => {
    setVerifyState((prev) => ({
      ...prev,
      [orderId]: { loading: true },
    }));

    try {
      const res = await fetch(`/api/orders/${orderId}/verify`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setVerifyState((prev) => ({
          ...prev,
          [orderId]: { loading: false, error: data.error },
        }));
        return;
      }

      setVerifyState((prev) => ({
        ...prev,
        [orderId]: {
          loading: false,
          code: data.code,
          expiresAt: data.expiresAt,
        },
      }));
    } catch {
      setVerifyState((prev) => ({
        ...prev,
        [orderId]: { loading: false, error: "Failed to send code" },
      }));
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active")
      return !["delivered", "cancelled"].includes(order.status);
    if (filter === "completed") return order.status === "delivered";
    return true;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-12 bg-gray-200 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your assigned delivery orders
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
        {[
          { key: "active", label: "Active", count: orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length },
          { key: "completed", label: "Completed", count: orders.filter((o) => o.status === "delivered").length },
          { key: "all", label: "All", count: orders.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No {filter} deliveries</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === "active"
              ? "You have no active deliveries at the moment"
              : "No orders match this filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const config = statusConfig[order.status] || statusConfig.pending;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {order.user?.profileImage ? (
                        <Image
                          src={order.user.profileImage}
                          alt={order.user.name || "Customer"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                          {order.user?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.deliveryAddress?.fullName} &middot;{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="font-bold text-gray-900">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Delivery Address
                      </h4>
                      <p className="text-sm font-medium text-gray-900">
                        {order.deliveryAddress?.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress?.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress?.city},{" "}
                        {order.deliveryAddress?.state}{" "}
                        {order.deliveryAddress?.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress?.country}
                      </p>
                      <p className="text-sm text-emerald-600 font-medium mt-2">
                        Phone: {order.deliveryAddress?.phone}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Items ({order.items?.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} <span className="text-gray-400">x{item.quantity}</span>
                            </span>
                            <span className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                          <span>Total</span>
                          <span>${order.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Customer
                      </h4>
                      <div className="flex items-center gap-3">
                        {order.user?.profileImage ? (
                          <Image
                            src={order.user.profileImage}
                            alt={order.user.name || "Customer"}
                            width={36}
                            height={36}
                            className="rounded-full object-cover w-9 h-9"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                            {order.user?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">
                            {order.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.email || ""}
                          </p>
                        </div>
                        {order.user?.profileImage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewPhoto({
                                src: order.user.profileImage,
                                name: order.user.name || "Customer",
                              });
                            }}
                            className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Photo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Verification Button */}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <button
                          onClick={() => setVerifyModal(order._id)}
                          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Verify Customer
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      {(order.status === "confirmed" ||
                        order.status === "shipped") && (
                        <button
                          onClick={() => updateStatus(order._id, "out_for_delivery")}
                          className="flex-1 bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                          Start Delivery
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button
                          onClick={() => updateStatus(order._id, "delivered")}
                          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mark as Delivered
                        </button>
                      )}
                      {order.status === "delivered" && (
                        <div className="flex-1 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm font-medium text-center">
                          ✓ Delivery Completed
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Verification Modal */}
      {verifyModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setVerifyModal(null);
            setScanOrderId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Verify Customer</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose a verification method</p>
              </div>
              <button
                onClick={() => {
                  setVerifyModal(null);
                  setScanOrderId(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* QR Scanner active */}
              {scanOrderId === verifyModal && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
                    </div>
                  }
                >
                  <QRScannerModal
                    orderId={scanOrderId}
                    embedded
                    onClose={() => setScanOrderId(null)}
                    onResult={(result) => {
                      if (result.verified) {
                        fetchOrders();
                      }
                    }}
                  />
                </Suspense>
              )}

              {/* Verification code display */}
              {verifyState[verifyModal]?.code && scanOrderId !== verifyModal && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-2">
                    Verification Code Sent to Customer
                  </p>
                  <p className="text-4xl font-extrabold text-indigo-700 tracking-[0.3em]">
                    {verifyState[verifyModal].code}
                  </p>
                  <p className="text-xs text-indigo-400 mt-3">
                    Ask the customer for this code &middot; Expires at{" "}
                    {new Date(verifyState[verifyModal].expiresAt).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Error display */}
              {verifyState[verifyModal]?.error && scanOrderId !== verifyModal && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                  {verifyState[verifyModal].error}
                </div>
              )}

              {/* Option buttons (show when no scanner is active) */}
              {scanOrderId !== verifyModal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email Code Option */}
                  <button
                    onClick={() => sendVerification(verifyModal)}
                    disabled={verifyState[verifyModal]?.loading}
                    className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all disabled:opacity-50 group"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {verifyState[verifyModal]?.loading ? "Sending..." : "Via Email Code"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Send a code to the customer&apos;s email
                      </p>
                    </div>
                  </button>

                  {/* QR Code Option */}
                  <button
                    onClick={() => setScanOrderId(verifyModal)}
                    className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">Via QR Code</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Scan the customer&apos;s order QR code
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Modal */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setViewPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{viewPhoto.name}</h3>
              <button
                onClick={() => setViewPhoto(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-gray-50">
              <Image
                src={viewPhoto.src}
                alt={viewPhoto.name}
                width={280}
                height={280}
                className="rounded-xl object-cover w-[280px] h-[280px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
