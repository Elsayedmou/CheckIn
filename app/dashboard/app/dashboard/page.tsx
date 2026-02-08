import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import { Card } from "../../components/Card";
import { AlertBadge } from "../../components/AlertBadge";
import DashboardClient from "./ui";
import { getDashboardData } from "../../lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const token = cookies().get(COOKIE_NAME)?.value!;
  const session = verifySession(token)!;
  const role = session.user.role;

  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = getLocaleForRole(role, reqLang);
  const data = await getDashboardData(role as any);

  const labels = {
    noActiveCycle: t(locale, "noActiveCycle"),
    activeCycle: t(locale, "activeCycle"),
    dayAge: t(locale, "dayAge"),
    currentBirds: t(locale, "currentBirds"),
    mortalityToday: t(locale, "mortalityToday"),
    mortalityTotal: t(locale, "mortalityTotal"),
    mortalityPct: t(locale, "mortalityPct"),
    feedToday: t(locale, "feedToday"),
    feedTotal: t(locale, "feedTotal"),
    avgWeight: t(locale, "avgWeight"),
    costs: t(locale, "costs"),
    chickCost: t(locale, "chickCost"),
    feedCost: t(locale, "feedCost"),
    medCost: t(locale, "medCost"),
    totalCost: t(locale, "totalCost"),
    alerts: t(locale, "alerts"),
    ok: t(locale, "ok"),
    warning: t(locale, "warning"),
    danger: t(locale, "danger")
  };

  if (!data?.cycle) {
    return (
      <div className="space-y-4">
        <Card title={labels.activeCycle}>
          <div className="text-gray-700">{labels.noActiveCycle}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title={labels.dayAge}><div className="text-2xl font-bold">{data.kpis.dayAge}</div></Card>
        <Card title={labels.currentBirds}><div className="text-2xl font-bold">{data.kpis.currentBirds}</div></Card>
        <Card title={labels.mortalityPct}><div className="text-2xl font-bold">{data.kpis.mortalityPct.toFixed(2)}%</div></Card>

        <Card title={labels.mortalityToday}><div className="text-2xl font-bold">{data.kpis.mortalityToday}</div></Card>
        <Card title={labels.mortalityTotal}><div className="text-2xl font-bold">{data.kpis.mortalityTotal}</div></Card>
        <Card title={labels.feedTotal}><div className="text-2xl font-bold">{data.kpis.feedTotal.toFixed(1)}</div></Card>

        <Card title={labels.feedToday}><div className="text-2xl font-bold">{data.kpis.feedToday.toFixed(1)}</div></Card>
        <Card title={labels.avgWeight}><div className="text-2xl font-bold">{data.kpis.avgWeightG ? data.kpis.avgWeightG.toFixed(0) : "—"}</div></Card>
        <Card title={labels.alerts}>
          <div className="flex flex-col gap-2">
            {data.alerts.length === 0 ? (
              <AlertBadge level="OK" text={labels.ok} />
            ) : (
              data.alerts.map((a: any) => (
                <div key={a.code} className="flex items-center justify-between gap-2">
                  <AlertBadge level={a.level} text={a.level === "WARNING" ? labels.warning : labels.danger} />
                  <div className="text-sm text-gray-700">{a.message}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Costs only for Admin/Manager */}
      {(role === "ADMIN" || role === "MANAGER") ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card title={labels.chickCost}><div className="text-xl font-bold">{data.kpis.costs.chicks.toFixed(2)}</div></Card>
          <Card title={labels.feedCost}><div className="text-xl font-bold">{data.kpis.costs.feed.toFixed(2)}</div></Card>
          <Card title={labels.medCost}><div className="text-xl font-bold">{data.kpis.costs.medication.toFixed(2)}</div></Card>
          <Card title={labels.totalCost}><div className="text-xl font-bold">{data.kpis.costs.total.toFixed(2)}</div></Card>
        </div>
      ) : null}

      <DashboardClient series={data.series} />
    </div>
  );
}
