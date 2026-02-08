import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import UsersClient from "./ui";

export default async function UsersPage() {
  const token = cookies().get(COOKIE_NAME)?.value!;
  const session = verifySession(token)!;

  const reqLang = cookies().get("checkin_lang")?.value ?? null;
  const locale = getLocaleForRole(session.user.role, reqLang);

  const labels = {
    users: t(locale, "users"),
    name: t(locale, "name"),
    email: t(locale, "email"),
    password: t(locale, "password"),
    role: t(locale, "role"),
    createUser: t(locale, "createUser"),
    save: t(locale, "save")
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/users`, { cache: "no-store", headers: { cookie: cookies().toString() } });
  const users = res.ok ? await res.json() : [];

  return <UsersClient labels={labels} users={users} />;
}
