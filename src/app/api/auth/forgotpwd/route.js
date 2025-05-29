import prisma from "@/lib/prisma";

export async function POST(req) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetExpires: expires },
  });

  // In real life: send email
  console.log(`Reset link: http://localhost:3000/reset-password?token=${token}`);

  return new Response(JSON.stringify({ message: "Reset link sent" }), { status: 200 });
}
