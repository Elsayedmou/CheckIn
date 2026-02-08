import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import DailyForm from "./ui";

export default function DailyPage() {
  const token = cookies().get(COOKIE_NAME)?.value!;
  const session = verifySession(token)!;

  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = getLocaleForRole(session.user.role, reqLang);

  const labels = {
    dailyEntry: t(locale, "dailyEntry"),
    recordDate: t(locale, "recordDate"),
    feedToday: t(locale, "feedToday"),
    mortalityToday: t(locale, "mortalityToday"),
    avgWeight: t(locale, "avgWeight"),
    medCost: t(locale, "medCost"),
    notes: t(locale, "notes"),
    medicationName: t(locale, "medicationName"),
    addMedication: t(locale, "addMedication"),
    save: t(locale, "save"),
  };

  return <DailyForm labels={labels} role={session.user.role} />;
}
