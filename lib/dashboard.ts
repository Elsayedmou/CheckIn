import { prisma } from "./prisma";
import { Role } from "@prisma/client";

function dateOnlyStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export async function getDashboardData(role: Role) {
  const cycle = await prisma.cycle.findFirst({ where: { status: "ACTIVE" }, include: { barn: true } });
  if (!cycle) return { cycle: null as any };

  const records = await prisma.dailyRecord.findMany({ where: { cycleId: cycle.id }, orderBy: { recordDate: "asc" } });
  const meds = await prisma.medicationLog.findMany({ where: { cycleId: cycle.id } });

  const start = cycle.startDate;
  const today = new Date();
  const dayAge = daysBetween(new Date(start), today) + 1;

  const mortalityTotal = records.reduce((a, r) => a + (r.mortalityCount || 0), 0);
  const feedTotal = records.reduce((a, r) => a + (r.feedKg || 0), 0);
  const last = records.length ? records[records.length - 1] : null;

  const mortalityToday = last ? (last.mortalityCount || 0) : 0;
  const feedToday = last ? (last.feedKg || 0) : 0;

  const currentBirds = Math.max(cycle.initialChicks - mortalityTotal, 0);
  const mortalityPct = cycle.initialChicks ? (mortalityTotal / cycle.initialChicks) * 100 : 0;

  const avgWeightG = last?.avgWeightG ?? null;

  // Costs
  const chicksCost = cycle.initialChicks * cycle.chickPrice;
  const feedCost = feedTotal * cycle.feedPricePerKg;
  const medicationCost =
    role === "WORKER"
      ? 0
      : records.reduce((a, r) => a + (r.medicationCost || 0), 0) + meds.reduce((a, m) => a + (m.cost || 0), 0);
  const totalCost = chicksCost + feedCost + medicationCost;

  // Sensors last 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sensors = await prisma.sensorReading.findMany({
    where: { barnId: cycle.barnId, timestamp: { gte: since24h } },
    orderBy: { timestamp: "asc" },
  });

  const latestSensor = sensors.length ? sensors[sensors.length - 1] : null;

  // Alerts based on thresholds and latest sensor
  const alerts: Array<{ code: string; level: "WARNING" | "DANGER"; message: string }> = [];
  if (latestSensor) {
    if (cycle.tempMinC != null && latestSensor.temperatureC != null && latestSensor.temperatureC < cycle.tempMinC) {
      alerts.push({ code: "TEMP_LOW", level: "WARNING", message: `الحرارة أقل من الحد (${latestSensor.temperatureC}°C)` });
    }
    if (cycle.tempMaxC != null && latestSensor.temperatureC != null && latestSensor.temperatureC > cycle.tempMaxC) {
      alerts.push({ code: "TEMP_HIGH", level: "DANGER", message: `الحرارة أعلى من الحد (${latestSensor.temperatureC}°C)` });
    }
    if (cycle.humidityMinPct != null && latestSensor.humidityPct != null && latestSensor.humidityPct < cycle.humidityMinPct) {
      alerts.push({ code: "HUM_LOW", level: "WARNING", message: `الرطوبة أقل من الحد (${latestSensor.humidityPct}%)` });
    }
    if (cycle.humidityMaxPct != null && latestSensor.humidityPct != null && latestSensor.humidityPct > cycle.humidityMaxPct) {
      alerts.push({ code: "HUM_HIGH", level: "WARNING", message: `الرطوبة أعلى من الحد (${latestSensor.humidityPct}%)` });
    }
    if (cycle.ammoniaMaxPpm != null && latestSensor.ammoniaPpm != null && latestSensor.ammoniaPpm > cycle.ammoniaMaxPpm) {
      alerts.push({ code: "NH3_HIGH", level: "DANGER", message: `الأمونيا أعلى من الحد (${latestSensor.ammoniaPpm}ppm)` });
    }
  }

  const daily = records.map((r) => ({
    date: dateOnlyStr(r.recordDate),
    feedKg: r.feedKg,
    mortalityCount: r.mortalityCount,
    avgWeightG: r.avgWeightG ?? null,
  }));

  const sensors24h = sensors.map((s) => ({
    time: s.timestamp.toISOString().slice(11, 16),
    temperatureC: s.temperatureC ?? null,
    humidityPct: s.humidityPct ?? null,
    ammoniaPpm: s.ammoniaPpm ?? null,
  }));

  return {
    cycle: { id: cycle.id, barnId: cycle.barnId, chickType: cycle.chickType, startDate: cycle.startDate },
    kpis: {
      dayAge,
      currentBirds,
      mortalityToday,
      mortalityTotal,
      mortalityPct,
      feedToday,
      feedTotal,
      avgWeightG,
      costs: { chicks: chicksCost, feed: feedCost, medication: medicationCost, total: totalCost },
    },
    alerts,
    series: { daily, sensors24h },
  };
}
