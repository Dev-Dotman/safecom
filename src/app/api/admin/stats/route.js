import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const [totalOrders, totalProducts, totalUsers, totalRevenue, recentOrders] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ role: "user" }),
        Order.aggregate([
          { $match: { paymentStatus: { $ne: "failed" } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.find()
          .populate("user", "name email")
          .sort("-createdAt")
          .limit(5),
      ]);

    return NextResponse.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
