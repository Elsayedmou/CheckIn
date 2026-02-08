"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@checkin.local");
  const [password, setPassword] = useState("Admin@12345");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j?.error || "Login failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-4">تسجيل الدخول / Sign in</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input className="w-full border rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input type="password" className="w-full border rounded-md px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <button className="w-full bg-black text-white rounded-md py-2">دخول / Sign in</button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          Default admin is created by seed: admin@checkin.local / Admin@12345
        </p>
      </div>
    </div>
  );
}
