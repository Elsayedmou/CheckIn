import "./globals.css";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../lib/auth";
import { getLocaleForRole, t } from "../lib/i18n";
import TopNav from "../components/TopNav";

export const metadata = { title: "CheckIn" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;

  const role = session?.user.role ?? "WORKER";
  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = session ? getLocaleForRole(role as any, reqLang) : "ar";

  const labels = {
    appName: t(locale, "appName"),
    dashboard: t(locale, "dashboard"),
    onboarding: t(locale, "onboarding"),
    dailyEntry: t(locale, "dailyEntry"),
    sensors: t(locale, "sensors"),
    users: t(locale, "users"),
    logout: t(locale, "logout"),
    language: t(locale, "language"),
    adminOnlyEnglish: t(locale, "adminOnlyEnglish"),
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="min-h-screen bg-gray-50">
        {session ? <TopNav locale={locale as any} labels={labels} role={role as any} /> : null}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
