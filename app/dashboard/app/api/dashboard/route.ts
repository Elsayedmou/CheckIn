import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../lib/auth";
import { getDashboardData } from "../../../lib/dashboard";

function dateOnlyStr(d: Date) {
  return d.toISOString().slice(0,10);
}
function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (24*60*60*1000));
}

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getDashboardData(s.user.role);
  return NextResponse.json(data);
}
