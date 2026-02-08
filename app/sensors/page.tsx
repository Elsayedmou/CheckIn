import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import SensorsForm from "./ui";

export default function SensorsPage() {
  const token = cookies().get(COOKIE_NAME)?.value!;
  const session = verifySession(token)!;

  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = getLocaleForRole(session.user.role, reqLang);

  const labels = {
    sensors: t(locale, "sensors"),
    timestamp: t(locale, "timestamp"),
    temperature: t(locale, "temperature"),
    humidity: t(locale, "humidity"),
    ammonia: t(locale, "ammonia"),
    save: t(locale, "save"),
  };

  return <SensorsForm labels={labels} />;
}
