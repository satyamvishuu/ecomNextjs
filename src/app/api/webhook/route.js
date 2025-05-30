import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.text(); // use raw body
  const signature = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_SECRET_KEY;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const data = JSON.parse(body);

  if (data.event === "payment.captured") {
    const paymentId = data.payload.payment.entity.id;
    const orderId = data.payload.payment.entity.order_id;

    // update your DB to mark payment successful
    await prisma.order.updateMany({
      where: { razorpayOrderId: orderId },
      data: {
        status: "PAID",
        paymentId: paymentId,
      },
    });
  }

  await prisma.download.create({
    data: {
      userId: user.id,
      productId,
    },
  });
  

  return NextResponse.json({ status: "ok" });
}
