import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

const seedProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, comfortable ear cushions, and built-in microphone for calls.",
    price: 79.99,
    category: "Electronics",
    images: ["https://placehold.co/600x600/4f46e5/white?text=Headphones"],
    stock: 50,
    rating: 4.5,
    numReviews: 128,
    featured: true,
  },
  {
    name: "Smart Watch Pro",
    description:
      "Track your fitness, monitor heart rate, and stay connected with notifications. Water-resistant with a bright AMOLED display and 7-day battery life.",
    price: 199.99,
    category: "Electronics",
    images: ["https://placehold.co/600x600/4f46e5/white?text=Smart+Watch"],
    stock: 30,
    rating: 4.7,
    numReviews: 256,
    featured: true,
  },
  {
    name: "Laptop Stand Aluminum",
    description:
      "Ergonomic adjustable laptop stand made from premium aluminum. Compatible with all laptops up to 17 inches. Improves posture and airflow.",
    price: 45.99,
    category: "Electronics",
    images: ["https://placehold.co/600x600/4f46e5/white?text=Laptop+Stand"],
    stock: 100,
    rating: 4.3,
    numReviews: 89,
    featured: false,
  },
  {
    name: "USB-C Hub 7-in-1",
    description:
      "Expand your connectivity with HDMI 4K, USB 3.0 ports, SD card reader, and 100W PD charging. Compact aluminum design.",
    price: 34.99,
    category: "Electronics",
    images: ["https://placehold.co/600x600/4f46e5/white?text=USB-C+Hub"],
    stock: 75,
    rating: 4.4,
    numReviews: 67,
    featured: false,
  },
  {
    name: "Classic Cotton T-Shirt",
    description:
      "Premium 100% organic cotton t-shirt. Comfortable fit, breathable fabric, and available in multiple colors. Perfect for everyday wear.",
    price: 24.99,
    category: "Clothing",
    images: ["https://placehold.co/600x600/059669/white?text=T-Shirt"],
    stock: 200,
    rating: 4.2,
    numReviews: 312,
    featured: true,
  },
  {
    name: "Denim Jacket",
    description:
      "Classic denim jacket with a modern fit. Made from durable cotton denim with brass buttons and multiple pockets.",
    price: 89.99,
    category: "Clothing",
    images: ["https://placehold.co/600x600/059669/white?text=Denim+Jacket"],
    stock: 45,
    rating: 4.6,
    numReviews: 178,
    featured: true,
  },
  {
    name: "Running Sneakers",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily runs and casual wear.",
    price: 119.99,
    category: "Clothing",
    images: ["https://placehold.co/600x600/059669/white?text=Sneakers"],
    stock: 60,
    rating: 4.8,
    numReviews: 445,
    featured: false,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, 750ml capacity.",
    price: 29.99,
    category: "Home & Kitchen",
    images: ["https://placehold.co/600x600/d97706/white?text=Water+Bottle"],
    stock: 150,
    rating: 4.6,
    numReviews: 203,
    featured: false,
  },
  {
    name: "Non-Stick Cookware Set",
    description:
      "10-piece premium non-stick cookware set. Includes frying pans, saucepans, and a Dutch oven. Dishwasher safe and PFOA-free.",
    price: 149.99,
    category: "Home & Kitchen",
    images: ["https://placehold.co/600x600/d97706/white?text=Cookware+Set"],
    stock: 25,
    rating: 4.5,
    numReviews: 134,
    featured: true,
  },
  {
    name: "Scented Candle Collection",
    description:
      "Set of 4 hand-poured soy wax candles with natural essential oils. Includes Lavender, Vanilla, Eucalyptus, and Cinnamon scents. 40-hour burn time each.",
    price: 39.99,
    category: "Home & Kitchen",
    images: ["https://placehold.co/600x600/d97706/white?text=Candles"],
    stock: 80,
    rating: 4.3,
    numReviews: 96,
    featured: false,
  },
  {
    name: "Yoga Mat Premium",
    description:
      "Extra thick 6mm yoga mat with non-slip surface. Made from eco-friendly TPE material. Includes carrying strap.",
    price: 34.99,
    category: "Sports",
    images: ["https://placehold.co/600x600/dc2626/white?text=Yoga+Mat"],
    stock: 90,
    rating: 4.4,
    numReviews: 167,
    featured: false,
  },
  {
    name: "Resistance Bands Set",
    description:
      "Set of 5 resistance bands with different tension levels. Includes door anchor, ankle straps, and carrying bag. Perfect for home workouts.",
    price: 19.99,
    category: "Sports",
    images: ["https://placehold.co/600x600/dc2626/white?text=Resistance+Bands"],
    stock: 120,
    rating: 4.5,
    numReviews: 289,
    featured: true,
  },
  {
    name: "Bestseller Novel Collection",
    description:
      "Curated collection of 5 award-winning novels. Handpicked from the year's best fiction. Beautifully packaged in a collector's box set.",
    price: 49.99,
    category: "Books",
    images: ["https://placehold.co/600x600/7c3aed/white?text=Book+Collection"],
    stock: 40,
    rating: 4.7,
    numReviews: 78,
    featured: false,
  },
  {
    name: "Programming Masterclass Book",
    description:
      "Comprehensive guide to modern web development. Covers JavaScript, React, Node.js, and more. Over 800 pages with hands-on projects.",
    price: 44.99,
    category: "Books",
    images: ["https://placehold.co/600x600/7c3aed/white?text=Programming+Book"],
    stock: 55,
    rating: 4.8,
    numReviews: 198,
    featured: false,
  },
  {
    name: "Portable Bluetooth Speaker",
    description:
      "Compact waterproof Bluetooth speaker with 360° sound. 12-hour battery life, built-in mic, and rugged design for outdoor adventures.",
    price: 59.99,
    category: "Electronics",
    images: ["https://placehold.co/600x600/4f46e5/white?text=BT+Speaker"],
    stock: 65,
    rating: 4.3,
    numReviews: 156,
    featured: false,
  },
];

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@safecom.com",
        password: hashedPassword,
        phone: "+1234567890",
        role: "admin",
        profileImage: "https://placehold.co/200x200/4f46e5/white?text=Admin",
        address: {
          street: "123 Admin St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
      },
      {
        name: "Delivery Person",
        email: "delivery@safecom.com",
        password: hashedPassword,
        phone: "+1234567891",
        role: "delivery",
        profileImage: "https://placehold.co/200x200/059669/white?text=Delivery",
        address: {
          street: "456 Delivery Ave",
          city: "New York",
          state: "NY",
          zipCode: "10002",
          country: "USA",
        },
      },
      {
        name: "John Doe",
        email: "user@safecom.com",
        password: hashedPassword,
        phone: "+1234567892",
        role: "user",
        profileImage: "https://placehold.co/200x200/d97706/white?text=John",
        address: {
          street: "789 User Lane",
          city: "New York",
          state: "NY",
          zipCode: "10003",
          country: "USA",
        },
      },
    ]);

    // Create products
    const products = await Product.insertMany(seedProducts);

    return NextResponse.json({
      message: "Database seeded successfully!",
      data: {
        users: users.length,
        products: products.length,
      },
      credentials: {
        admin: { email: "admin@safecom.com", password: "password123" },
        delivery: { email: "delivery@safecom.com", password: "password123" },
        user: { email: "user@safecom.com", password: "password123" },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
