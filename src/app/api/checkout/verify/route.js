import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get("token")?.value;
    const user = await getUserFromToken(token);
    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse payment details
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, receipt } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount || !currency || !receipt) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // 3. Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // 4. Save order
    await prisma.order.create({
      data: {
        userId: user.id,
        orderId: razorpay_order_id,
        amount: amount,
        currency: currency,
        paymentId: razorpay_payment_id,
        status: "PAID",
        receipt: receipt,
      },
    });

    // 5. Fetch user's cart with items and products
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || !cart.items.length) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    // 6. Create download entries for each product in cart
    for (const item of cart.items) {
      await prisma.download.create({
        data: {
          userId: user.id,
          productId: item.productId,
        },
      });
    }

    // 7. Clear cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ success: true, message: "Payment verified, downloads unlocked." });
  } catch (error) {
    console.error("Verify Checkout Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
