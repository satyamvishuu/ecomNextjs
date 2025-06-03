import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET); // For testing ONLY

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("MW", payload);

    if (pathname.startsWith("/dashboard/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/checkout/:path*",
    "/api/products/:path*",
    "/api/cart",
    "/api/checkout",
    "/api/orders"
  ],
};
