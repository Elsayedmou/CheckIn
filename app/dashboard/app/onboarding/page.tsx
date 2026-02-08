import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import OnboardingForm from "./ui";

export default function OnboardingPage() {
  const token = cookies().get(COOKIE_NAME)?.value!;
  const session = verifySession(token)!;

  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = getLocaleForRole(session.user.role, reqLang);

  const labels = {
    onboarding: t(locale, "onboarding"),
    barnName: t(locale, "barnName"),
    barnCode: t(locale, "barnCode"),
    capacity: t(locale, "capacity"),
    area: t(locale, "area"),
    cycle: t(locale, "cycle"),
    chickType: t(locale, "chickType"),
    startDate: t(locale, "startDate"),
    expectedDays: t(locale, "expectedDays"),
    initialChicks: t(locale, "initialChicks"),
    chickPrice: t(locale, "chickPrice"),
    feedPrice: t(locale, "feedPrice"),
    targets: t(locale, "targets"),
    targetMortality: t(locale, "targetMortality"),
    targetFcr: t(locale, "targetFcr"),
    thresholds: t(locale, "thresholds"),
    tempMin: t(locale, "tempMin"),
    tempMax: t(locale, "tempMax"),
    humMin: t(locale, "humMin"),
    humMax: t(locale, "humMax"),
    ammoniaMax: t(locale, "ammoniaMax"),
    save: t(locale, "save")
  };

  return <OnboardingForm labels={labels} />;
}
