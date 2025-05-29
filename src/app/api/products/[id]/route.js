import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(_, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  const user = await getUserFromToken();

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const updatedProduct = await prisma.product.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updatedProduct);
}

export async function DELETE(_, { params }) {
  const user = await getUserFromToken();

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Product deleted" });
}
