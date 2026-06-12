import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const SESSION_COOKIE_NAME = "quarteto_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  email: string;
  name: string;
  userId: string;
};

function getAuthSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "quarteto-list-dev-secret-change-me",
  );
}

export async function createAdminSession(payload: SessionPayload) {
  const token = await new SignJWT({
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function readAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionToken, getAuthSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      userId: payload.sub,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!admin) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, admin.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return {
    email: admin.email,
    id: admin.id,
    name: admin.name,
  };
}

export async function getCurrentAdmin() {
  const session = await readAdminSession();

  if (!session) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      email: true,
      id: true,
      name: true,
    },
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}