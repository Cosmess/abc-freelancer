import { UserRole } from "@/generated/prisma/client";

export function getRoleHomePath(role: UserRole): string {
  if (role === UserRole.ADMIN) {
    return "/admin";
  }

  if (role === UserRole.ESTABLISHMENT) {
    return "/app/estabelecimento";
  }

  return "/app/freelancer";
}

export function getAppUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
    "http://localhost:3000";

  return rawUrl.replace(/\\r\\n|\\n|\\r/g, "").trim().replace(/\/+$/, "");
}
