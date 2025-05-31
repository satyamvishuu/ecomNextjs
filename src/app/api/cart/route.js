import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET: Fetch the user's cart and its items
export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Add to cart: user =", user.id, "productId =", productId);
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  console.log("Product found:", product);

  return NextResponse.json(cart || {});
}

// POST: Add or update an item in the user's cart
export async function POST(req) {
  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  // Validate input
  if (!productId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
  }

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Find or create the user's cart
  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  // Add or update item in the cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return NextResponse.json({ message: "Item added to cart" });
}
