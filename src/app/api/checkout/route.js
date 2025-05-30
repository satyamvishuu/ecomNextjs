import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req) {
  // 1. Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Debug log: Check if token is received
  console.log("Token:", token);

  // 2. Get user from token
  const user = await getUserFromToken(token);

  // Debug log: Check if user is found
  console.log("User:", user);

  if (!user || (user.role !== "USER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Fetch user's cart and items (with product details)
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true, // Access product name and price
        },
      },
    },
  });

  if (!cart || !cart.items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // 4. Calculate total amount
  const amount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  try {
    // 5. Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 6. Save order to DB
    const savedOrder = await prisma.order.create({
      data: {
        userId: user.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
      },
    });

    // 7. Prepare items array for response
    const orderItems = cart.items.map(item => ({
      productId: item.product.id,
      name: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // 8. Respond with order details including quantity and product name
    return NextResponse.json({
      order,        // Razorpay order details
      savedOrder,   // Your DB order details
      items: orderItems,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
