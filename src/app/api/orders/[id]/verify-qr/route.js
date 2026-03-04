import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "delivery") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json(
        { error: "QR data is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("deliveryPerson", "name");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Parse QR data
    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return NextResponse.json(
        { error: "Invalid QR code format" },
        { status: 400 }
      );
    }

    // Verify QR data matches order
    const checks = {
      orderId: parsed.orderId === order._id.toString(),
      orderNumber:
        parsed.orderNumber === order._id.toString().slice(-8).toUpperCase(),
      customerName:
        parsed.customerName === order.deliveryAddress.fullName,
      deliveryCity: parsed.deliveryCity === order.deliveryAddress.city,
      totalAmount: parsed.totalAmount === order.totalAmount,
    };

    const allMatch = Object.values(checks).every(Boolean);

    return NextResponse.json({
      verified: allMatch,
      checks,
      message: allMatch
        ? "QR code verified successfully — order details match!"
        : "Verification failed — some details do not match the order.",
    });
  } catch (error) {
    console.error("QR verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify QR code" },
      { status: 500 }
    );
  }
}
