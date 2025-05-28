import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return new Response(
      JSON.stringify({ message: "User created", user: { id: user.id, email: user.email, role: user.role } }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error); // <-- This will help you debug
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
