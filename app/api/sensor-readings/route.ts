import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(token);
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const active = await prisma.cycle.findFirst({ where: { status: "ACTIVE" }, include: { barn: true } });
  if (!active) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const reading = await prisma.sensorReading.create({
    data: {
      barnId: active.barnId,
      timestamp: new Date(body.timestamp),
      temperatureC: body.temperatureC == null ? null : Number(body.temperatureC),
      humidityPct: body.humidityPct == null ? null : Number(body.humidityPct),
      ammoniaPpm: body.ammoniaPpm == null ? null : Number(body.ammoniaPpm),
      source: "manual"
    }
  });

  return NextResponse.json({ ok: true, reading });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "24h";

  const active = await prisma.cycle.findFirst({ where: { status: "ACTIVE" }, include: { barn: true } });
  if (!active) return NextResponse.json([]);

  let since = new Date();
  if (range === "7d") since = new Date(Date.now() - 7*24*60*60*1000);
  else since = new Date(Date.now() - 24*60*60*1000);

  const readings = await prisma.sensorReading.findMany({
    where: { barnId: active.barnId, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" }
  });
  return NextResponse.json(readings);
}
