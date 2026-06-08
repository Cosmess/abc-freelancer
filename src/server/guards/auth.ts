import { cache } from "react";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import {
  findInternalUserByAuthId,
  syncInternalUserFromSupabaseUser,
  type InternalUser,
} from "@/lib/auth/internal-user-store";
import { getRoleHomePath } from "@/lib/auth/paths";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  await syncInternalUserFromSupabaseUser(authUser);

  return findInternalUserByAuthId(authUser.id);
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerifiedAt) {
    redirect("/auth/confirmar-email");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role && user.role !== UserRole.ADMIN) {
    redirect(getRoleHomePath(user.role));
  }

  return user;
}

export function requireFreelancer() {
  return requireRole(UserRole.FREELANCER);
}

export function requireEstablishment() {
  return requireRole(UserRole.ESTABLISHMENT);
}

export function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}

async function hasActiveSubscription(userId: string): Promise<boolean> {
  const activeStatuses = ["ACTIVE", "AUTHORIZED", "TRIALING"];
  const { data } = await getSupabaseAdminClient()
    .from("Subscription")
    .select("id")
    .eq("userId", userId)
    .in("status", activeStatuses)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function requireActiveAccess(user: InternalUser): Promise<void> {
  // ADMINs always have access
  if (user.role === UserRole.ADMIN) return;

  // Trial still valid
  if (new Date() <= new Date(user.trialEndsAt)) return;

  // Check for an active paid subscription
  const active = await hasActiveSubscription(user.id);

  if (!active) {
    const planPath =
      user.role === UserRole.ESTABLISHMENT
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
    redirect(planPath);
  }
}
