import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import { UserRole } from "@/generated/prisma/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type InternalUser = {
  id: string;
  supabaseAuthUserId: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  emailVerifiedAt: string | null;
  termsAcceptedAt: string | null;
  trialStartsAt: string;
  trialEndsAt: string;
};

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

function getAuthUserName(authUser: SupabaseAuthUser): string {
  const metadata = authUser.user_metadata ?? {};

  if (typeof metadata.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }

  return authUser.email ?? "Usuario";
}

export async function findInternalUserByEmail(email: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("User")
    .select("*")
    .eq("email", email)
    .maybeSingle<InternalUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function findInternalUserByAuthId(supabaseAuthUserId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("User")
    .select("*")
    .eq("supabaseAuthUserId", supabaseAuthUserId)
    .maybeSingle<InternalUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function findAuthUserByEmail(email: string) {
  const { data, error } = await getSupabaseAdminClient().auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return data.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  ) ?? null;
}

export async function confirmAuthEmailIfInternallyVerified(email: string) {
  const internalUser = await findInternalUserByEmail(email);

  if (!internalUser?.emailVerifiedAt) {
    return false;
  }

  const authUser = await findAuthUserByEmail(email);

  if (!authUser) {
    return false;
  }

  if (authUser.email_confirmed_at) {
    return true;
  }

  const { error } = await getSupabaseAdminClient().auth.admin.updateUserById(
    authUser.id,
    {
      email_confirm: true,
    },
  );

  if (error) {
    throw error;
  }

  return true;
}

export async function syncInternalUserFromSupabaseUser(
  authUser: SupabaseAuthUser,
) {
  const supabase = getSupabaseAdminClient();
  const existing = await findInternalUserByAuthId(authUser.id);
  const metadata = authUser.user_metadata ?? {};
  const role = parseRole(metadata.role);
  const emailVerifiedAt = authUser.email_confirmed_at ?? null;

  if (existing) {
    // role is intentionally NOT updated here — it is set at creation time and
    // managed internally. user_metadata is user-controlled and must not
    // be trusted for authorization decisions on existing accounts.
    const { data, error } = await supabase
      .from("User")
      .update({
        email: authUser.email ?? existing.email,
        name: getAuthUserName(authUser),
        emailVerifiedAt,
      })
      .eq("id", existing.id)
      .select("*")
      .single<InternalUser>();

    if (error) {
      throw error;
    }

    return data;
  }

  const createdAt = new Date(authUser.created_at);
  const now = new Date();
  const { data, error } = await supabase
    .from("User")
    .insert({
      id: randomUUID(),
      supabaseAuthUserId: authUser.id,
      email: authUser.email ?? "",
      name: getAuthUserName(authUser),
      role,
      emailVerifiedAt,
      trialStartsAt: createdAt.toISOString(),
      trialEndsAt: getTrialEndsAt(createdAt).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .select("*")
    .single<InternalUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function createInternalFreelancerUser(input: {
  supabaseAuthUserId: string;
  email: string;
  fullName: string;
  phone?: string;
  whatsapp?: string;
  city: string;
  neighborhood?: string;
  termsAcceptedAt: string;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date();

  const { data: user, error: userError } = await supabase
    .from("User")
    .insert({
      id: randomUUID(),
      supabaseAuthUserId: input.supabaseAuthUserId,
      email: input.email,
      name: input.fullName,
      phone: input.phone || null,
      role: UserRole.FREELANCER,
      termsAcceptedAt: input.termsAcceptedAt,
      trialStartsAt: now.toISOString(),
      trialEndsAt: getTrialEndsAt(now).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .select("*")
    .single<InternalUser>();

  if (userError) {
    throw userError;
  }

  const { error: profileError } = await supabase.from("FreelancerProfile").insert({
    id: randomUUID(),
    userId: user.id,
    fullName: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp || null,
    city: input.city,
    neighborhood: input.neighborhood || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  if (profileError) {
    throw profileError;
  }

  return user;
}

export async function createInternalEstablishmentUser(input: {
  supabaseAuthUserId: string;
  email: string;
  responsibleName: string;
  phone?: string;
  tradeName: string;
  whatsapp?: string;
  city: string;
  neighborhood?: string;
  termsAcceptedAt: string;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date();

  const { data: user, error: userError } = await supabase
    .from("User")
    .insert({
      id: randomUUID(),
      supabaseAuthUserId: input.supabaseAuthUserId,
      email: input.email,
      name: input.responsibleName,
      phone: input.phone || null,
      role: UserRole.ESTABLISHMENT,
      termsAcceptedAt: input.termsAcceptedAt,
      trialStartsAt: now.toISOString(),
      trialEndsAt: getTrialEndsAt(now).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .select("*")
    .single<InternalUser>();

  if (userError) {
    throw userError;
  }

  const { error: profileError } = await supabase
    .from("EstablishmentProfile")
    .insert({
      id: randomUUID(),
      userId: user.id,
      tradeName: input.tradeName,
      email: input.email,
      whatsapp: input.whatsapp || null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

  if (profileError) {
    throw profileError;
  }

  return user;
}
