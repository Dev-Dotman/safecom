import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id)
      .populate("user", "name email profileImage")
      .populate("deliveryPerson", "name email phone");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      session.user.role !== "admin" &&
      session.user.role !== "delivery" &&
      order.user._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (session.user.role === "admin") {
      if (body.status) order.status = body.status;
      if (body.deliveryPerson) {
        order.deliveryPerson = body.deliveryPerson;
        if (order.status === "pending") {
          order.status = "confirmed";
        }
      }
      if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    } else if (session.user.role === "delivery") {
      if (body.status && ["out_for_delivery", "delivered"].includes(body.status)) {
        order.status = body.status;
      }
    } else if (order.user.toString() === session.user.id) {
      if (body.status === "cancelled" && order.status === "pending") {
        order.status = "cancelled";
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("user", "name email profileImage")
      .populate("deliveryPerson", "name email phone");

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
