// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { getUserFromToken } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function GET(_, context) {
//   const params = await context.params;
//   const product = await prisma.product.findUnique({
//     where: { id: params.id },
//   });
//   if (!product) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }
//   return NextResponse.json(product);
// }

// export async function PUT(req, context) {
//   const params = await context.params;
//   const token = cookies().get("token")?.value;
//   const user = await getUserFromToken(token);

//   if (user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const data = await req.json();
//   const product = await prisma.product.findUnique({ where: { id: params.id } });
//   if (!product) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   const updatedProduct = await prisma.product.update({
//     where: { id: params.id },
//     data,
//   });

//   return NextResponse.json(updatedProduct);
// }

// export async function DELETE(_, context) {
//   const params = await context.params;
//   const token = cookies().get("token")?.value;
//   const user = await getUserFromToken(token);

//   if (user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const product = await prisma.product.findUnique({ where: { id: params.id } });
//   if (!product) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   await prisma.product.delete({
//     where: { id: params.id },
//   });

//   return NextResponse.json({ message: "Product deleted" });
// }


import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = params.productId;

    // Check if user has a PAID order for this product
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        orderItems: {
          some: {
            productId: productId,
          },
        },
        status: "PAID",
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "No purchase found" }, { status: 403 });
    }

    // Fetch product download URL (assuming product has fileUrl)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.fileUrl) {
      return NextResponse.json({ error: "Product not found or no file" }, { status: 404 });
    }

    // Return download link
    return NextResponse.json({ downloadUrl: product.fileUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
