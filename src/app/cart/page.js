"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, mounted } = useCart();

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-20 h-20 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-6">
          Looks like you haven&apos;t added anything yet
        </p>
        <Link
          href="/products"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                <Image
                  src={
                    item.image ||
                    "https://placehold.co/200x200/e5e7eb/9ca3af?text=No+Image"
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-indigo-600 font-bold mt-1">
                  ₦{item.price.toFixed(2)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          Math.min(item.stock, item.quantity + 1)
                        )
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>
                Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
              <span>₦{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span>₦{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mt-6"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="block text-center text-sm text-indigo-600 hover:underline mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
