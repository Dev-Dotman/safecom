import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-3">SafeCom</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Safe Commerce — Your trusted marketplace for quality products.
              Shop with confidence, enjoy fast delivery, and experience
              world-class customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-white transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li>support@safecom.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Commerce St, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SafeCom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
