import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(s.user.role === "ADMIN" || s.user.role === "MANAGER")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  // Upsert Barn by code
  const barn = await prisma.barn.upsert({
    where: { code: body.barnCode || "DEFAULT" },
    update: {
      name: body.barnName,
      capacity: Number(body.capacity) || null,
      areaM2: Number(body.areaM2) || null
    },
    create: {
      name: body.barnName,
      code: body.barnCode || "DEFAULT",
      capacity: Number(body.capacity) || null,
      areaM2: Number(body.areaM2) || null
    }
  });

  // Close any existing active cycles for that barn (simple MVP)
  await prisma.cycle.updateMany({ where: { barnId: barn.id, status: "ACTIVE" }, data: { status: "CLOSED" } });

  const cycle = await prisma.cycle.create({
    data: {
      barnId: barn.id,
      chickType: String(body.chickType || "broiler"),
      startDate: new Date(body.startDate),
      expectedDays: Number(body.expectedDays) || 35,
      initialChicks: Number(body.initialChicks) || 0,
      chickPrice: Number(body.chickPrice) || 0,
      feedPricePerKg: Number(body.feedPricePerKg) || 0,

      targetMortalityPct: body.targetMortalityPct === "" || body.targetMortalityPct == null ? null : Number(body.targetMortalityPct),
      targetFcr: body.targetFcr === "" || body.targetFcr == null ? null : Number(body.targetFcr),

      tempMinC: body.tempMinC === "" || body.tempMinC == null ? null : Number(body.tempMinC),
      tempMaxC: body.tempMaxC === "" || body.tempMaxC == null ? null : Number(body.tempMaxC),
      humidityMinPct: body.humidityMinPct === "" || body.humidityMinPct == null ? null : Number(body.humidityMinPct),
      humidityMaxPct: body.humidityMaxPct === "" || body.humidityMaxPct == null ? null : Number(body.humidityMaxPct),
      ammoniaMaxPpm: body.ammoniaMaxPpm === "" || body.ammoniaMaxPpm == null ? null : Number(body.ammoniaMaxPpm),

      status: "ACTIVE"
    }
  });

  return NextResponse.json({ ok: true, barn, cycle });
}
