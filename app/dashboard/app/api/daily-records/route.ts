import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

function toDateOnly(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return x;
}

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const cycle = await prisma.cycle.findFirst({ where: { status: "ACTIVE" }, include: { barn: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const recordDate = toDateOnly(new Date(body.recordDate));

  const rec = await prisma.dailyRecord.upsert({
    where: { cycleId_recordDate: { cycleId: cycle.id, recordDate } },
    update: {
      feedKg: Number(body.feedKg) || 0,
      mortalityCount: Number(body.mortalityCount) || 0,
      avgWeightG: body.avgWeightG == null ? null : Number(body.avgWeightG),
      medicationCost: (s.user.role === "WORKER") ? null : (body.medicationCost == null ? null : Number(body.medicationCost)),
      notes: body.notes ? String(body.notes) : null
    },
    create: {
      cycleId: cycle.id,
      recordDate,
      feedKg: Number(body.feedKg) || 0,
      mortalityCount: Number(body.mortalityCount) || 0,
      avgWeightG: body.avgWeightG == null ? null : Number(body.avgWeightG),
      medicationCost: (s.user.role === "WORKER") ? null : (body.medicationCost == null ? null : Number(body.medicationCost)),
      notes: body.notes ? String(body.notes) : null
    }
  });

  // meds log (append for the day)
  if (Array.isArray(body.meds) && body.meds.length > 0) {
    // delete existing meds for that day first (simple: replace)
    await prisma.medicationLog.deleteMany({ where: { cycleId: cycle.id, recordDate } });
    await prisma.medicationLog.createMany({
      data: body.meds
        .filter((m:any)=>m?.name)
        .map((m:any)=>({
          cycleId: cycle.id,
          recordDate,
          name: String(m.name),
          cost: m.cost == null ? null : Number(m.cost),
          notes: m.notes ? String(m.notes) : null
        }))
    });
  }

  return NextResponse.json({ ok: true, rec });
}

export async function GET() {
  const cycle = await prisma.cycle.findFirst({ where: { status: "ACTIVE" } });
  if (!cycle) return NextResponse.json([]);
  const records = await prisma.dailyRecord.findMany({ where: { cycleId: cycle.id }, orderBy: { recordDate: "asc" } });
  return NextResponse.json(records);
}
