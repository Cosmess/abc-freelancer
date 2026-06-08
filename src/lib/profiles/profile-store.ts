import { randomUUID } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type FreelancerProfile = {
  id: string;
  userId: string;
  fullName: string;
  cpf: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  cep: string | null;
  bio: string | null;
  experience: string | null;
  profilePhotoUrl: string | null;
  status: string;
};

export type EstablishmentProfile = {
  id: string;
  userId: string;
  tradeName: string;
  legalName: string | null;
  cnpj: string;
  whatsapp: string | null;
  email: string | null;
  type: string | null;
  description: string | null;
  status: string;
  cep: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
};

export async function getFreelancerProfile(userId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("FreelancerProfile")
    .select("*")
    .eq("userId", userId)
    .maybeSingle<FreelancerProfile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getEstablishmentProfile(userId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("EstablishmentProfile")
    .select("*")
    .eq("userId", userId)
    .maybeSingle<EstablishmentProfile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserBasics(input: {
  userId: string;
  name: string;
  phone?: string | null;
}) {
  const { error } = await getSupabaseAdminClient()
    .from("User")
    .update({
      name: input.name,
      phone: input.phone || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", input.userId);

  if (error) {
    throw error;
  }
}

export async function upsertFreelancerProfile(input: {
  userId: string;
  fullName: string;
  cpf?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  cep?: string | null;
  bio?: string | null;
  experience?: string | null;
  profilePhotoUrl?: string | null;
}) {
  const existing = await getFreelancerProfile(input.userId);
  const now = new Date().toISOString();
  const payload = {
    fullName: input.fullName,
    cpf: input.cpf || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    city: input.city || null,
    neighborhood: input.neighborhood || null,
    street: input.street || null,
    cep: input.cep || null,
    bio: input.bio || null,
    experience: input.experience || null,
    profilePhotoUrl: input.profilePhotoUrl || null,
    updatedAt: now,
  };

  const query = existing
    ? getSupabaseAdminClient()
        .from("FreelancerProfile")
        .update(payload)
        .eq("id", existing.id)
    : getSupabaseAdminClient()
        .from("FreelancerProfile")
        .insert({
          id: randomUUID(),
          userId: input.userId,
          ...payload,
          createdAt: now,
        });

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function upsertEstablishmentProfile(input: {
  userId: string;
  tradeName: string;
  legalName?: string | null;
  cnpj: string;
  whatsapp?: string | null;
  email?: string | null;
  type?: string | null;
  description?: string | null;
  cep?: string | null;
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
}) {
  const existing = await getEstablishmentProfile(input.userId);
  const now = new Date().toISOString();
  const payload = {
    tradeName: input.tradeName,
    legalName: input.legalName || null,
    cnpj: input.cnpj,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    type: input.type || null,
    description: input.description || null,
    cep: input.cep || null,
    state: input.state || null,
    city: input.city || null,
    neighborhood: input.neighborhood || null,
    street: input.street || null,
    number: input.number || null,
    complement: input.complement || null,
    updatedAt: now,
  };

  const query = existing
    ? getSupabaseAdminClient()
        .from("EstablishmentProfile")
        .update(payload)
        .eq("id", existing.id)
    : getSupabaseAdminClient()
        .from("EstablishmentProfile")
        .insert({
          id: randomUUID(),
          userId: input.userId,
          ...payload,
          createdAt: now,
        });

  const { error } = await query;

  if (error) {
    throw error;
  }
}
