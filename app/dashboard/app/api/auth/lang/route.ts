import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../../lib/auth";

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lang } = await req.json();
  if (s.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("checkin_lang", lang === "en" ? "en" : "ar", { path: "/" });
  return res;
}
