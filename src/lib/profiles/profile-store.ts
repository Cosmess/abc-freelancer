import { randomUUID } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type FreelancerProfile = {
  id: string;
  userId: string;
  fullName: string;
  cpf: string | null;
  whatsapp: string | null;
  instagram: string | null;
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

export type Specialty = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
};

export type Availability = {
  id: string;
  freelancerId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

export type EstablishmentProfile = {
  id: string;
  userId: string;
  tradeName: string;
  legalName: string | null;
  cnpj: string;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  type: string | null;
  description: string | null;
  profilePhotoUrl: string | null;
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

export async function getActiveSpecialties() {
  const { data, error } = await getSupabaseAdminClient()
    .from("Specialty")
    .select("id,name,slug,category")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true })
    .returns<Specialty[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getFreelancerSpecialtyIds(freelancerId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("FreelancerSpecialty")
    .select("specialtyId")
    .eq("freelancerId", freelancerId)
    .returns<Array<{ specialtyId: string }>>();

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((item) => item.specialtyId));
}

export async function getFreelancerAvailability(freelancerId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("Availability")
    .select("*")
    .eq("freelancerId", freelancerId)
    .returns<Availability[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
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
  instagram?: string | null;
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
    ...(input.instagram !== undefined ? { instagram: input.instagram || null } : {}),
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
        .select("*")
        .single<FreelancerProfile>()
    : getSupabaseAdminClient()
        .from("FreelancerProfile")
        .insert({
          id: randomUUID(),
          userId: input.userId,
          ...payload,
          createdAt: now,
        })
        .select("*")
        .single<FreelancerProfile>();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function replaceFreelancerSpecialties(input: {
  freelancerId: string;
  specialtyIds: string[];
}) {
  const supabase = getSupabaseAdminClient();
  const { error: deleteError } = await supabase
    .from("FreelancerSpecialty")
    .delete()
    .eq("freelancerId", input.freelancerId);

  if (deleteError) {
    throw deleteError;
  }

  if (!input.specialtyIds.length) {
    return;
  }

  const { error } = await supabase.from("FreelancerSpecialty").insert(
    input.specialtyIds.map((specialtyId) => ({
      id: randomUUID(),
      freelancerId: input.freelancerId,
      specialtyId,
      createdAt: new Date().toISOString(),
    })),
  );

  if (error) {
    throw error;
  }
}

export async function replaceFreelancerAvailability(input: {
  freelancerId: string;
  preferences: Array<{ dayOfWeek: string; shift: string }>;
}) {
  const supabase = getSupabaseAdminClient();
  const { error: deleteError } = await supabase
    .from("Availability")
    .delete()
    .eq("freelancerId", input.freelancerId);

  if (deleteError) {
    throw deleteError;
  }

  if (!input.preferences.length) {
    return;
  }

  const now = new Date().toISOString();
  const shiftTimes: Record<string, { startTime: string; endTime: string }> = {
    madrugada: { startTime: "00:00", endTime: "06:00" },
    manha: { startTime: "06:00", endTime: "12:00" },
    tarde: { startTime: "12:00", endTime: "18:00" },
    noite: { startTime: "18:00", endTime: "23:59" },
  };

  const validDays = new Set([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ]);

  const rows: Array<{
    id: string;
    freelancerId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
    createdAt: string;
    updatedAt: string;
  }> = [];

  input.preferences.forEach((preference) => {
      if (!validDays.has(preference.dayOfWeek)) {
        return;
      }

      const shift = shiftTimes[preference.shift];

      if (!shift) {
        return;
      }

      rows.push({
        id: randomUUID(),
        freelancerId: input.freelancerId,
        dayOfWeek: preference.dayOfWeek,
        startTime: shift.startTime,
        endTime: shift.endTime,
        available: true,
        createdAt: now,
        updatedAt: now,
      });
    });

  const { error } = await supabase.from("Availability").insert(rows);

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
  instagram?: string | null;
  email?: string | null;
  type?: string | null;
  description?: string | null;
  profilePhotoUrl?: string | null;
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
    ...(input.instagram !== undefined ? { instagram: input.instagram || null } : {}),
    email: input.email || null,
    type: input.type || null,
    description: input.description || null,
    profilePhotoUrl: input.profilePhotoUrl || null,
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

// ---------------------------------------------------------------------------
// Freelancer catalog
// ---------------------------------------------------------------------------

export const CATALOG_PAGE_SIZE = 12;

const DAY_ABBREVIATIONS: Record<string, string> = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sab",
  SUNDAY: "Dom",
};

const SHIFT_LABELS: Record<string, string> = {
  "00:00": "Madrugada",
  "06:00": "Manha",
  "12:00": "Tarde",
  "18:00": "Noite",
};

const SHIFT_START_TIMES: Record<string, string> = {
  madrugada: "00:00",
  manha: "06:00",
  tarde: "12:00",
  noite: "18:00",
};

export type FreelancerCatalogItem = {
  id: string;
  fullName: string;
  city: string | null;
  neighborhood: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  instagram: string | null;
  specialties: Array<{ id: string; name: string }>;
  shifts: string[];
};

export type FreelancerCatalogResult = {
  items: FreelancerCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getFreelancerCatalog(input: {
  city?: string;
  specialtyId?: string;
  shift?: string;
  page?: number;
}): Promise<FreelancerCatalogResult> {
  const supabase = getSupabaseAdminClient();
  const page = Math.max(1, input.page ?? 1);

  // Collect ID constraints from relational filters
  const idSets: Set<string>[] = [];

  if (input.specialtyId) {
    const { data } = await supabase
      .from("FreelancerSpecialty")
      .select("freelancerId")
      .eq("specialtyId", input.specialtyId)
      .returns<Array<{ freelancerId: string }>>();
    idSets.push(new Set((data ?? []).map((r) => r.freelancerId)));
  }

  if (input.shift && SHIFT_START_TIMES[input.shift]) {
    const { data } = await supabase
      .from("Availability")
      .select("freelancerId")
      .eq("startTime", SHIFT_START_TIMES[input.shift])
      .eq("available", true)
      .returns<Array<{ freelancerId: string }>>();
    idSets.push(new Set((data ?? []).map((r) => r.freelancerId)));
  }

  // Intersect all ID sets — early-out if any set is empty
  let allowedIds: string[] | null = null;
  if (idSets.length > 0) {
    const intersected = idSets.reduce((acc, cur) => {
      const next = new Set<string>();
      acc.forEach((id) => { if (cur.has(id)) next.add(id); });
      return next;
    });
    if (intersected.size === 0) {
      return { items: [], total: 0, page, pageSize: CATALOG_PAGE_SIZE, totalPages: 0 };
    }
    allowedIds = Array.from(intersected);
  }

  // Main query with count
  let query = supabase
    .from("FreelancerProfile")
    .select("id,fullName,city,neighborhood,bio,profilePhotoUrl,instagram", { count: "exact" })
    .eq("status", "APPROVED")
    .order("fullName", { ascending: true })
    .range((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE - 1);

  if (input.city) {
    query = query.ilike("city", `%${input.city}%`);
  }

  if (allowedIds) {
    query = query.in("id", allowedIds);
  }

  const { data: profiles, error, count } = await query.returns<
    Array<{
      id: string;
      fullName: string;
      city: string | null;
      neighborhood: string | null;
      bio: string | null;
      profilePhotoUrl: string | null;
      instagram: string | null;
    }>
  >();

  if (error) throw error;

  const freelancerIds = (profiles ?? []).map((p) => p.id);

  if (!freelancerIds.length) {
    const total = count ?? 0;
    return { items: [], total, page, pageSize: CATALOG_PAGE_SIZE, totalPages: Math.ceil(total / CATALOG_PAGE_SIZE) };
  }

  // Batch-load specialties and availability
  const [specialtyRows, availabilityRows] = await Promise.all([
    supabase
      .from("FreelancerSpecialty")
      .select("freelancerId,specialtyId")
      .in("freelancerId", freelancerIds)
      .returns<Array<{ freelancerId: string; specialtyId: string }>>(),
    supabase
      .from("Availability")
      .select("freelancerId,dayOfWeek,startTime")
      .in("freelancerId", freelancerIds)
      .eq("available", true)
      .returns<Array<{ freelancerId: string; dayOfWeek: string; startTime: string }>>(),
  ]);

  // Resolve specialty names
  const uniqueSpecialtyIds = Array.from(new Set((specialtyRows.data ?? []).map((r) => r.specialtyId)));
  let specialtyNameMap = new Map<string, string>();

  if (uniqueSpecialtyIds.length) {
    const { data: names } = await supabase
      .from("Specialty")
      .select("id,name")
      .in("id", uniqueSpecialtyIds)
      .returns<Array<{ id: string; name: string }>>();
    specialtyNameMap = new Map((names ?? []).map((s) => [s.id, s.name]));
  }

  // Group per freelancer
  const specialtiesByFreelancer = new Map<string, Array<{ id: string; name: string }>>();
  (specialtyRows.data ?? []).forEach((row) => {
    const name = specialtyNameMap.get(row.specialtyId);
    if (!name) return;
    const list = specialtiesByFreelancer.get(row.freelancerId) ?? [];
    list.push({ id: row.specialtyId, name });
    specialtiesByFreelancer.set(row.freelancerId, list);
  });

  const shiftsByFreelancer = new Map<string, string[]>();
  (availabilityRows.data ?? []).forEach((row) => {
    const day = DAY_ABBREVIATIONS[row.dayOfWeek] ?? row.dayOfWeek;
    const shift = SHIFT_LABELS[row.startTime] ?? row.startTime;
    const list = shiftsByFreelancer.get(row.freelancerId) ?? [];
    list.push(`${day} ${shift}`);
    shiftsByFreelancer.set(row.freelancerId, list);
  });

  const total = count ?? 0;

  return {
    items: (profiles ?? []).map((profile) => ({
      ...profile,
      instagram: profile.instagram ?? null,
      specialties: specialtiesByFreelancer.get(profile.id) ?? [],
      shifts: shiftsByFreelancer.get(profile.id) ?? [],
    })),
    total,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    totalPages: Math.ceil(total / CATALOG_PAGE_SIZE),
  };
}
