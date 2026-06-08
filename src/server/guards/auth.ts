import { cache } from "react";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getRoleHomePath } from "@/lib/auth/paths";
import { syncInternalUserFromSupabaseUser } from "@/lib/auth/sync-user";
import { getPrisma } from "@/lib/prisma";
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

  return getPrisma().user.findUnique({
    where: { supabaseAuthUserId: authUser.id },
    include: {
      establishmentProfile: true,
      freelancerProfile: true,
    },
  });
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
