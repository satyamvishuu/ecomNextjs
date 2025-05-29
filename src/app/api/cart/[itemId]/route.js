import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req, context) {
  const params = await context.params;
  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quantity } = await req.json();

  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: params.itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: params.itemId },
    data: { quantity },
  });

  return NextResponse.json(updatedItem);
}

export async function DELETE(req, context) {
  const params = await context.params;
  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: params.itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: params.itemId } });

  return NextResponse.json({ message: "Item removed" });
}
