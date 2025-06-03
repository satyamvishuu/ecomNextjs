import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

  // Create expected signature
  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = shasum.digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
  }

  // Optional: Store order/payment in DB
  await prisma.order.create({
    data: {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      userId, // optional if you have user info
      amount: 499, // optional
      status: "PAID",
    },
  });

  await prisma.download.create({
    data: {
      userId: user.id,
      productId: purchasedProduct.id, // Get this from cart or receipt
    },
  });

  return NextResponse.json({ success: true, message: "Payment verified successfully" });
}
