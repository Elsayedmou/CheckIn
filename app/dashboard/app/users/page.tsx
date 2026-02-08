import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "../../lib/auth";
import { getLocaleForRole, t } from "../../lib/i18n";
import UsersClient from "./ui";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

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
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, role:true, isActive:true, createdAt:true }});

  return <UsersClient labels={labels} users={users} />;
}
