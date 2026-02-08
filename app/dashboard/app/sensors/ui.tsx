"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SensorsForm({ labels }: { labels: Record<string,string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  const nowLocal = new Date();
  const iso = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset()*60000).toISOString().slice(0,16);

  const [form, setForm] = useState({
    timestamp: iso,
    temperatureC: "",
    humidityPct: "",
    ammoniaPpm: ""
  });

  function set(k: string, v: any){ setForm(prev => ({...prev, [k]: v})); }

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true); setMsg(null);

    const payload:any = {
      timestamp: new Date(form.timestamp).toISOString(),
      temperatureC: form.temperatureC===""?null:Number(form.temperatureC),
      humidityPct: form.humidityPct===""?null:Number(form.humidityPct),
      ammoniaPpm: form.ammoniaPpm===""?null:Number(form.ammoniaPpm),
    };

    const r = await fetch("/api/sensor-readings", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(()=>({}));
    setLoading(false);
    if(!r.ok){ setMsg(j.error || "Error"); return; }
    setMsg("تم الحفظ");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{labels.sensors}</h1>

      <form onSubmit={submit} className="rounded-xl border bg-white p-4 space-y-3">
        <div>
          <label className="text-sm text-gray-600">{labels.timestamp}</label>
          <input type="datetime-local" className="w-full border rounded-md px-3 py-2" value={form.timestamp} onChange={(e)=>set("timestamp", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">{labels.temperature}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.temperatureC} onChange={(e)=>set("temperatureC", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">{labels.humidity}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.humidityPct} onChange={(e)=>set("humidityPct", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">{labels.ammonia}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.ammoniaPpm} onChange={(e)=>set("ammoniaPpm", e.target.value)} />
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
