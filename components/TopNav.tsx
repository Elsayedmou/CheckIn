"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@prisma/client";

export default function TopNav({
  locale,
  labels,
  role,
}: {
  locale: "ar" | "en";
  labels: Record<string, string>;
  role: Role;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function toggleLang() {
    const next = locale === "ar" ? "en" : "ar";
    await fetch("/api/auth/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: next }),
    });
    router.refresh();
  }

  const Item = ({ href, text }: { href: string; text: string }) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm ${
        pathname === href ? "bg-black text-white" : "hover:bg-gray-100"
      }`}
    >
      {text}
    </Link>
  );

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="font-bold">{labels.appName}</div>
          <div className="text-xs text-gray-500">({role})</div>
        </div>

        <div className="flex items-center gap-1 flex-wrap justify-end">
          <Item href="/dashboard" text={labels.dashboard} />
          <Item href="/onboarding" text={labels.onboarding} />
          <Item href="/daily" text={labels.dailyEntry} />
          <Item href="/sensors" text={labels.sensors} />
          {role === "ADMIN" ? <Item href="/users" text={labels.users} /> : null}

          {role === "ADMIN" ? (
            <button
              onClick={toggleLang}
              className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50"
              title={labels.adminOnlyEnglish}
            >
              {labels.language}: {locale.toUpperCase()}
            </button>
          ) : (
            <span className="px-3 py-2 rounded-md text-sm text-gray-500">
              {labels.language}: AR
            </span>
          )}

          <button
            onClick={logout}
            className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50"
          >
            {labels.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
