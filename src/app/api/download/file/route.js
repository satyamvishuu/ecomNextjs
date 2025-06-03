import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import path from "path";
import { createReadStream } from "fs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || !productId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: "PAID",
      downloads: {
        some: {
          productId: productId,
        },
      },
    },
    include: {
      downloads: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filePath = path.resolve("public", product.filePath);
  const stream = createReadStream(filePath);

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${product.title}.pdf"`,
    },
  });
}
