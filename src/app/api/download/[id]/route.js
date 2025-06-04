import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function GET(req, context) {
  const params = await context.params;
  const productId = params.id;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user) {
    console.log("Unauthorized access");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const download = await prisma.download.findFirst({
    where: { userId: user.id, productId },
  });
  if (!download) {
    console.log("User does not own this product", user.id, productId);
    return NextResponse.json({ error: "You do not own this file." }, { status: 403 });
  }

  console.log("Looking for product with id:", productId);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    console.log("Product not found:", productId);
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "storage", product.fileUrl);
  if (!fs.existsSync(filePath)) {
    console.log("File not found on disk:", filePath);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(product.fileUrl)}"`,
    },
  });
}
