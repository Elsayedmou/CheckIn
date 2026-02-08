"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm({ labels }: { labels: Record<string, string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    barnName: "عنبر 1",
    barnCode: "BARN-01",
    capacity: 20000,
    areaM2: 0,

    chickType: "فراخ بيضاء",
    startDate: new Date().toISOString().slice(0,10),
    expectedDays: 35,
    initialChicks: 20000,
    chickPrice: 20,
    feedPricePerKg: 18,

    targetMortalityPct: 5,
    targetFcr: 1.65,

    tempMinC: 20,
    tempMaxC: 34,
    humidityMinPct: 40,
    humidityMaxPct: 75,
    ammoniaMaxPpm: 20
  });

  function set(k: string, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const r = await fetch("/api/setup/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setMsg(j.error || "Error"); return; }
    setMsg("تم الحفظ");
    router.push("/dashboard");
    router.refresh();
  }

  const Input = ({ k, type="text" }: { k: keyof typeof form; type?: string }) => (
    <input
      type={type}
      className="w-full border rounded-md px-3 py-2"
      value={(form[k] as any) ?? ""}
      onChange={(e) => set(k as string, type === "number" ? Number(e.target.value) : e.target.value)}
    />
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{labels.onboarding}</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="font-semibold">1) {labels.onboarding}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-sm text-gray-600">{labels.barnName}</label><Input k="barnName" /></div>
            <div><label className="text-sm text-gray-600">{labels.barnCode}</label><Input k="barnCode" /></div>
            <div><label className="text-sm text-gray-600">{labels.capacity}</label><Input k="capacity" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.area}</label><Input k="areaM2" type="number" /></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="font-semibold">2) {labels.cycle}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-sm text-gray-600">{labels.chickType}</label><Input k="chickType" /></div>
            <div><label className="text-sm text-gray-600">{labels.startDate}</label><Input k="startDate" type="date" /></div>
            <div><label className="text-sm text-gray-600">{labels.expectedDays}</label><Input k="expectedDays" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.initialChicks}</label><Input k="initialChicks" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.chickPrice}</label><Input k="chickPrice" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.feedPrice}</label><Input k="feedPricePerKg" type="number" /></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="font-semibold">3) {labels.targets}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-sm text-gray-600">{labels.targetMortality}</label><Input k="targetMortalityPct" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.targetFcr}</label><Input k="targetFcr" type="number" /></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="font-semibold">4) {labels.thresholds}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label className="text-sm text-gray-600">{labels.tempMin}</label><Input k="tempMinC" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.tempMax}</label><Input k="tempMaxC" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.ammoniaMax}</label><Input k="ammoniaMaxPpm" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.humMin}</label><Input k="humidityMinPct" type="number" /></div>
            <div><label className="text-sm text-gray-600">{labels.humMax}</label><Input k="humidityMaxPct" type="number" /></div>
          </div>
        </div>

        {msg ? <div className="text-sm text-green-700">{msg}</div> : null}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded-md">
          {loading ? "..." : labels.save}
        </button>
      </form>
    </div>
  );
}
