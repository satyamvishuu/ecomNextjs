import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/products
export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = await getUserFromToken(token);
  
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, price, fileUrl } = body;

    // Validate input
    if (
      !title ||
      !description ||
      typeof price !== "number" ||
      price < 0 ||
      !fileUrl
    ) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Make sure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Create product with required relation
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        fileUrl,
        createdBy: user.id, // This links the product to the admin
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
