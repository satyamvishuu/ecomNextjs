// /src/app/api/downloads/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const downloads = await prisma.download.findMany({
    where: { userId: user.id, status: "PAID" },
    include: { product: true },
  });

  return NextResponse.json({ downloads });
}
