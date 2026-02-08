import { NextResponse } from "next/server";
import { authenticate, signSession, COOKIE_NAME } from "../../../../lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

  const user = await authenticate(email, password);
  if (!user) return NextResponse.json({ error: "Invalid email/password" }, { status: 401 });

  const token = signSession(user);
  const res = NextResponse.json({ ok: true, user: { email: user.email, role: user.role, name: user.name } });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false
  });

  // Persist requested language cookie to user's language at login (admin default en)
  res.cookies.set("checkin_lang", user.role === "ADMIN" ? "en" : "ar", { path: "/" });

  return res;
}
