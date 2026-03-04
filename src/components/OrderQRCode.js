"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function OrderQRCode({ order }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !order) return;

    const qrData = JSON.stringify({
      orderId: order._id,
      orderNumber: order._id.slice(-8).toUpperCase(),
      customerName: order.deliveryAddress?.fullName,
      deliveryCity: order.deliveryAddress?.city,
      totalAmount: order.totalAmount,
    });

    QRCode.toCanvas(canvasRef.current, qrData, {
      width: 160,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });
  }, [order]);

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-gray-500 text-center">
        Show this to your rider for verification
      </p>
    </div>
  );
}
