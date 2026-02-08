import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role, Language } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  language: Language;
};

const COOKIE_NAME = "checkin_session";

export function signSession(user: SessionUser) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ user }, secret, { expiresIn: "7d" });
}

export function verifySession(token: string): { user: SessionUser } | null {
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !u.isActive) return null;
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, language: u.language };
}

export { COOKIE_NAME };
