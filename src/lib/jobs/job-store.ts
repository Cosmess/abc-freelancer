import { randomUUID } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type JobPost = {
  id: string;
  establishmentId: string;
  title: string;
  description: string | null;
  specialtyId: string;
  city: string;
  neighborhood: string | null;
  street: string | null;
  number: string | null;
  cep: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  paymentType: string;
  paymentValue: number;
  quantity: number;
  requirements: string | null;
  status: string;
  createdAt: string;
};

export async function getJobPostsByEstablishment(establishmentId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .eq("establishmentId", establishmentId)
    .order("createdAt", { ascending: false })
    .returns<JobPost[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getOpenJobPosts() {
  const { data, error } = await getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .eq("status", "OPEN")
    .order("workDate", { ascending: true })
    .returns<JobPost[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createJobPost(input: {
  establishmentId: string;
  title: string;
  description?: string | null;
  specialtyId: string;
  city: string;
  neighborhood?: string | null;
  street?: string | null;
  number?: string | null;
  cep?: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  paymentType: string;
  paymentValue: number;
  quantity: number;
  requirements?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("JobPost")
    .insert({
      id: randomUUID(),
      establishmentId: input.establishmentId,
      title: input.title,
      description: input.description || null,
      specialtyId: input.specialtyId,
      city: input.city,
      neighborhood: input.neighborhood || null,
      street: input.street || null,
      number: input.number || null,
      cep: input.cep || null,
      workDate: new Date(`${input.workDate}T00:00:00`).toISOString(),
      startTime: input.startTime,
      endTime: input.endTime,
      paymentType: input.paymentType,
      paymentValue: input.paymentValue,
      quantity: input.quantity,
      requirements: input.requirements || null,
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    })
    .select("*")
    .single<JobPost>();

  if (error) {
    throw error;
  }

  return data;
}
