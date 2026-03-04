import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = {};

    if (session.user.role === "admin") {
      if (status) query.status = status;
    } else if (session.user.role === "delivery") {
      query.deliveryPerson = session.user.id;
      if (status) query.status = status;
    } else {
      query.user = session.user.id;
    }

    const orders = await Order.find(query)
      .populate("user", "name email profileImage")
      .populate("deliveryPerson", "name email phone")
      .sort("-createdAt");

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const order = await Order.create({
      user: session.user.id,
      items: body.items,
      totalAmount: body.totalAmount,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod || "cod",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
