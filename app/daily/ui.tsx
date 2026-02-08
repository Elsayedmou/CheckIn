"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

export default function DailyForm({ labels, role }: { labels: Record<string,string>, role: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  const [form, setForm] = useState({
    recordDate: new Date().toISOString().slice(0,10),
    feedKg: 0,
    mortalityCount: 0,
    avgWeightG: "",
    medicationCost: "",
    notes: ""
  });

  const [meds, setMeds] = useState<Array<{name: string; cost: string; notes: string}>>([]);

  function set(k: string, v: any){ setForm(prev => ({...prev, [k]: v})); }

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true); setMsg(null);

    const payload:any = {
      ...form,
      avgWeightG: form.avgWeightG === "" ? null : Number(form.avgWeightG),
      medicationCost: form.medicationCost === "" ? null : Number(form.medicationCost),
      feedKg: Number(form.feedKg),
      mortalityCount: Number(form.mortalityCount),
      meds: meds.map(m => ({ name: m.name, cost: m.cost===""?null:Number(m.cost), notes: m.notes || null }))
    };

    const r = await fetch("/api/daily-records", {
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
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{labels.dailyEntry}</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">{labels.recordDate}</label>
            <input type="date" className="w-full border rounded-md px-3 py-2" value={form.recordDate} onChange={(e)=>set("recordDate", e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-gray-600">{labels.feedToday}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.feedKg} onChange={(e)=>set("feedKg", e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-gray-600">{labels.mortalityToday}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.mortalityCount} onChange={(e)=>set("mortalityCount", e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-gray-600">{labels.avgWeight}</label>
            <input type="number" className="w-full border rounded-md px-3 py-2" value={form.avgWeightG} onChange={(e)=>set("avgWeightG", e.target.value)} placeholder="اختياري" />
          </div>

          {(role === "ADMIN" || role === "MANAGER") ? (
            <div>
              <label className="text-sm text-gray-600">{labels.medCost}</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" value={form.medicationCost} onChange={(e)=>set("medicationCost", e.target.value)} placeholder="اختياري" />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">{labels.notes}</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={form.notes} onChange={(e)=>set("notes", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{labels.addMedication}</div>
            <button type="button" className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50"
              onClick={()=>setMeds(prev => [...prev, {name:"", cost:"", notes:""}])}>
              + {labels.addMedication}
            </button>
          </div>

          {meds.length === 0 ? <div className="text-sm text-gray-500">—</div> : null}

          {meds.map((m, idx)=>(
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input className="border rounded-md px-3 py-2" placeholder={labels.medicationName} value={m.name}
                onChange={(e)=>setMeds(prev => prev.map((x,i)=> i===idx? {...x, name:e.target.value}:x))} />
              <input className="border rounded-md px-3 py-2" placeholder={labels.medCost} value={m.cost}
                onChange={(e)=>setMeds(prev => prev.map((x,i)=> i===idx? {...x, cost:e.target.value}:x))} />
              <input className="border rounded-md px-3 py-2" placeholder={labels.notes} value={m.notes}
                onChange={(e)=>setMeds(prev => prev.map((x,i)=> i===idx? {...x, notes:e.target.value}:x))} />
            </div>
          ))}
        </div>

        {msg ? <div className="text-sm text-green-700">{msg}</div> : null}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded-md">
          {loading ? "..." : labels.save}
        </button>
      </form>
    </div>
  );
}
