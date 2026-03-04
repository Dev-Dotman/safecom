import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { render } from "@react-email/components";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import transporter from "@/lib/mailer";
import VerificationCodeEmail from "@/emails/VerificationCodeEmail";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "delivery") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      order.deliveryPerson &&
      order.deliveryPerson.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "This order is not assigned to you" },
        { status: 403 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    order.verificationCode = code;
    order.verificationExpiry = expiry;
    await order.save();

    // Render email with React Email
    const emailHtml = await render(
      VerificationCodeEmail({
        customerName: order.user.name,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        verificationCode: code,
        riderName: session.user.name,
      })
    );

    // Send email
    await transporter.sendMail({
      from: `"SafeCom Delivery" <${process.env.SMTP_USER || "noreply@safecom.com"}>`,
      to: order.user.email,
      subject: `Your Delivery Verification Code - Order #${order._id
        .toString()
        .slice(-8)
        .toUpperCase()}`,
      html: emailHtml,
    });

    return NextResponse.json({
      message: "Verification code sent to customer",
      code,
      expiresAt: expiry.toISOString(),
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
