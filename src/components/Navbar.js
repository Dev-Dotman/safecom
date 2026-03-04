"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "./CartProvider";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-emerald-700"
          >
            <ShoppingBag className="w-7 h-7" strokeWidth={2.25} />
            SafeCom
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {(!session || session.user.role !== "admin") && (
              <>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Products
                </Link>

                <Link
                  href="/cart"
                  className="relative text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-5 bg-indigo-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {session ? (
              <>
                {session.user.role !== "admin" && (
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                  >
                    My Orders
                  </Link>
                )}

                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}

                {session.user.role === "delivery" && (
                  <Link
                    href="/delivery"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Deliveries
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                  Sign Up
                </Link>
                <Link
                  href="/delivery/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  Become a Rider
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {(!session || session.user.role !== "admin") && (
              <>
                <Link
                  href="/products"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Products
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cart ({cartCount})
                </Link>
              </>
            )}
            {session ? (
              <>
                {session.user.role !== "admin" && (
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    My Orders
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Profile
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {session.user.role === "delivery" && (
                  <Link
                    href="/delivery"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Deliveries
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-indigo-600 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Sign Up
                </Link>
                <Link
                  href="/delivery/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-emerald-600 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Become a Rider
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
