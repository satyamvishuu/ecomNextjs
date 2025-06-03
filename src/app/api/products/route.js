import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "desc" }, // use createdAt if you add it
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("API /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

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

    if (
      !title ||
      !description ||
      typeof price !== "number" ||
      price < 0 ||
      !fileUrl
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        fileUrl,
        createdBy: user.id, // <--- this matches your schema!
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("API /api/products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
