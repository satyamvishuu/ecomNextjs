import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || !productId) {
    return NextResponse.json({ access: false }, { status: 401 });
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
  });

  return NextResponse.json({ access: !!order });
}
