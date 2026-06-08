import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { UserRole } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

const trialDays = 7;

function getTrialEndsAt(startsAt: Date): Date {
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + trialDays);
  return endsAt;
}

function parseRole(value: unknown): UserRole {
  if (
    value === UserRole.ADMIN ||
    value === UserRole.ESTABLISHMENT ||
    value === UserRole.FREELANCER
  ) {
    return value;
  }

  return UserRole.FREELANCER;
}

export async function syncInternalUserFromSupabaseUser(
  authUser: SupabaseAuthUser,
) {
  const prisma = getPrisma();
  const metadata = authUser.user_metadata ?? {};
  const role = parseRole(metadata.role);
  const createdAt = new Date(authUser.created_at);
  const name =
    typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : authUser.email ?? "Usuario";

  return prisma.user.upsert({
    where: { supabaseAuthUserId: authUser.id },
    update: {
      email: authUser.email ?? "",
      name,
      role,
      emailVerifiedAt: authUser.email_confirmed_at
        ? new Date(authUser.email_confirmed_at)
        : null,
    },
    create: {
      supabaseAuthUserId: authUser.id,
      email: authUser.email ?? "",
      name,
      role,
      emailVerifiedAt: authUser.email_confirmed_at
        ? new Date(authUser.email_confirmed_at)
        : null,
      trialStartsAt: createdAt,
      trialEndsAt: getTrialEndsAt(createdAt),
    },
  });
}

export async function createInternalFreelancerUser(input: {
  supabaseAuthUserId: string;
  email: string;
  fullName: string;
  whatsapp?: string;
  cpf?: string;
  city: string;
  neighborhood?: string;
}) {
  const prisma = getPrisma();
  const now = new Date();

  return prisma.user.create({
    data: {
      supabaseAuthUserId: input.supabaseAuthUserId,
      email: input.email,
      name: input.fullName,
      role: UserRole.FREELANCER,
      trialStartsAt: now,
      trialEndsAt: getTrialEndsAt(now),
      freelancerProfile: {
        create: {
          fullName: input.fullName,
          email: input.email,
          whatsapp: input.whatsapp || null,
          cpf: input.cpf || null,
          city: input.city,
          neighborhood: input.neighborhood || null,
        },
      },
    },
  });
}

export async function createInternalEstablishmentUser(input: {
  supabaseAuthUserId: string;
  email: string;
  responsibleName: string;
  tradeName: string;
  whatsapp?: string;
  cnpj: string;
  city: string;
  neighborhood?: string;
}) {
  const prisma = getPrisma();
  const now = new Date();

  return prisma.user.create({
    data: {
      supabaseAuthUserId: input.supabaseAuthUserId,
      email: input.email,
      name: input.responsibleName,
      role: UserRole.ESTABLISHMENT,
      trialStartsAt: now,
      trialEndsAt: getTrialEndsAt(now),
      establishmentProfile: {
        create: {
          tradeName: input.tradeName,
          email: input.email,
          whatsapp: input.whatsapp || null,
          cnpj: input.cnpj,
          city: input.city,
          neighborhood: input.neighborhood || null,
        },
      },
    },
  });
}
