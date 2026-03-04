"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, cartTotal, clearCart, mounted } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [profileAddress, setProfileAddress] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  // Fetch user profile to prefill address
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const user = await res.json();
          const addr = user.address || {};
          const hasAddress = addr.street || addr.city;
          if (hasAddress) {
            const prefilled = {
              fullName: user.name || "",
              street: addr.street || "",
              city: addr.city || "",
              state: addr.state || "",
              zipCode: addr.zipCode || "",
              country: addr.country || "",
              phone: user.phone || "",
            };
            setProfileAddress(prefilled);
            setAddress(prefilled);
            setUseProfileAddress(true);
          } else {
            setUseProfileAddress(false);
          }
        }
      } catch {
        setUseProfileAddress(false);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  const switchToCustom = () => {
    setUseProfileAddress(false);
    setAddress({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "", phone: "" });
  };

  const switchToProfile = () => {
    if (profileAddress) {
      setUseProfileAddress(true);
      setAddress(profileAddress);
    }
  };

  if (status === "loading" || !mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign in to Checkout
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

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: cartTotal,
          deliveryAddress: address,
          paymentMethod: "cod",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order");
        return;
      }

      clearCart();
      router.push(`/orders?success=true`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Address */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Delivery Address
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
                  {error}
                </div>
              )}

              {/* Address source toggle */}
              {profileAddress && !profileLoading && (
                <div className="flex gap-2 mb-5 bg-gray-50 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={switchToProfile}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      useProfileAddress
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Saved Address
                  </button>
                  <button
                    type="button"
                    onClick={switchToCustom}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !useProfileAddress
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Use Different Address
                  </button>
                </div>
              )}

              {/* Prefilled address summary */}
              {useProfileAddress && profileAddress && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{profileAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{profileAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {[profileAddress.city, profileAddress.state, profileAddress.zipCode].filter(Boolean).join(", ")}
                      </p>
                      {profileAddress.country && <p className="text-sm text-gray-600">{profileAddress.country}</p>}
                      {profileAddress.phone && <p className="text-sm text-indigo-600 mt-1">Phone: {profileAddress.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className={useProfileAddress && profileAddress ? "hidden" : "space-y-4"}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Recipient's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="123 Main St, Apt 4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.zipCode}
                      onChange={(e) =>
                        setAddress({ ...address, zipCode: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.country}
                      onChange={(e) =>
                        setAddress({ ...address, country: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="USA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Payment Method
                </h3>
                <p className="text-sm text-gray-600">
                  Cash on Delivery (COD)
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={
                        item.image ||
                        "https://placehold.co/100x100/e5e7eb/9ca3af?text=No+Image"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 mt-6"
            >
              {loading ? "Placing Order..." : `Place Order - $${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
