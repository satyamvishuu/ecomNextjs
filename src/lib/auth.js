// File: lib/getUserFromToken.js
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function getUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user;
  } catch (e) {
    return null;
  }
}



