// src/app/api/download/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Check if this user owns the product
  const validDownload = await prisma.download.findFirst({
    where: { userId: user.id, productId: id },
  });

  if (!validDownload) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Send the actual file
  const fileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/downloads/${id}.zip`;

  return NextResponse.redirect(fileUrl);
}
