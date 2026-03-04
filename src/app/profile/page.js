"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign in to view your profile
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {session.user.name}
            </h2>
            <p className="text-gray-500">{session.user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full capitalize">
              {session.user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">My Orders</h3>
            <p className="text-sm text-gray-500 mt-1">
              View your order history
            </p>
          </Link>

          <Link
            href="/cart"
            className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Shopping Cart</h3>
            <p className="text-sm text-gray-500 mt-1">
              View items in your cart
            </p>
          </Link>

          {session.user.role === "admin" && (
            <Link
              href="/admin"
              className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Admin Dashboard</h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage your store
              </p>
            </Link>
          )}

          {session.user.role === "delivery" && (
            <Link
              href="/delivery"
              className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Delivery Dashboard</h3>
              <p className="text-sm text-gray-500 mt-1">
                View your deliveries
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
