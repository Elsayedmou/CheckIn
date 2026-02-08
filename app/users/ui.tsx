"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersClient({ labels, users }: { labels: Record<string,string>, users: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "WORKER" });
  const [msg, setMsg] = useState<string|null>(null);

  function set(k: string, v: any){ setForm(prev=>({...prev, [k]: v})); }

  async function create(e: React.FormEvent){
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/admin/users", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok){ setMsg(j.error || "Error"); return; }
    setMsg("تم الإنشاء");
    router.refresh();
    setForm({ name:"", email:"", password:"", role:"WORKER" });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{labels.users}</h1>

      <form onSubmit={create} className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm text-gray-600">{labels.name}</label>
          <input className="w-full border rounded-md px-3 py-2" value={form.name} onChange={(e)=>set("name", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">{labels.email}</label>
          <input className="w-full border rounded-md px-3 py-2" value={form.email} onChange={(e)=>set("email", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">{labels.password}</label>
          <input type="password" className="w-full border rounded-md px-3 py-2" value={form.password} onChange={(e)=>set("password", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">{labels.role}</label>
          <select className="w-full border rounded-md px-3 py-2" value={form.role} onChange={(e)=>set("role", e.target.value)}>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="WORKER">WORKER</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center gap-3">
          <button className="bg-black text-white px-4 py-2 rounded-md">{labels.createUser}</button>
          {msg ? <div className="text-sm text-green-700">{msg}</div> : null}
        </div>
      </form>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-50 text-sm font-semibold p-3">
          <div>{labels.name}</div>
          <div>{labels.email}</div>
          <div>{labels.role}</div>
          <div>Status</div>
        </div>
        {users.map((u)=>(
          <div key={u.id} className="grid grid-cols-4 text-sm p-3 border-t">
            <div>{u.name}</div>
            <div>{u.email}</div>
            <div>{u.role}</div>
            <div>{u.isActive ? "Active" : "Disabled"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
