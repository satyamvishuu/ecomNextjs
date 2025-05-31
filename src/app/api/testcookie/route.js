import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("testcookie", "hello", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 5,
  });
  return response;
}
