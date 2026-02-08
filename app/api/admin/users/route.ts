import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s || s.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, role:true, isActive:true, createdAt:true }});
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s || s.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.email || !body.password || !body.name || !body.role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(String(body.password), 10);

  const user = await prisma.user.create({
    data: {
      email: String(body.email).toLowerCase(),
      name: String(body.name),
      passwordHash,
      role: body.role,
      language: body.role === "ADMIN" ? "en" : "ar"
    }
  });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
}
