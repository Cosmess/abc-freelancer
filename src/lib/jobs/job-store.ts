import { randomUUID } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const JOBS_PAGE_SIZE = 12;

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

export type JobApplication = {
  id: string;
  jobPostId: string;
  freelancerId: string;
  message: string | null;
  status: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
};

export type JobListing = JobPost & {
  establishmentName: string;
  establishmentPhotoUrl: string | null;
  specialtyName: string;
  applicationStatus?: string | null;
};

export type EstablishmentJobPost = JobPost & {
  acceptedApplicationCount: number;
  totalApplicationCount: number;
};

export type FreelancerApplicationListing = JobApplication & {
  job: JobPost;
  establishmentName: string;
  establishmentPhotoUrl: string | null;
  establishmentWhatsapp: string | null;
  establishmentInstagram: string | null;
  specialtyName: string;
};

export type EstablishmentApplicationListing = JobApplication & {
  job: JobPost;
  freelancer: {
    id: string;
    fullName: string;
    email: string | null;
    whatsapp: string | null;
    instagram: string | null;
    profilePhotoUrl: string | null;
    city: string | null;
    neighborhood: string | null;
    bio: string | null;
    experience: string | null;
    specialties: string[];
  };
};

export type JobListingsPageResult = {
  items: JobListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EstablishmentJobPostsPageResult = {
  items: EstablishmentJobPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type FreelancerApplicationsPageResult = {
  items: FreelancerApplicationListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type OpenJobFilters = {
  city?: string;
  neighborhood?: string;
  specialtyId?: string;
};

function isFutureOrTodayJob(job: JobPost) {
  const workDate = job.workDate.slice(0, 10);
  const endsAt = new Date(`${workDate}T${job.endTime}:00`);

  return Number.isNaN(endsAt.getTime()) || endsAt >= new Date();
}

async function getSpecialtyNames(ids: string[]) {
  if (!ids.length) return new Map<string, string>();

  const { data, error } = await getSupabaseAdminClient()
    .from("Specialty")
    .select("id,name")
    .in("id", Array.from(new Set(ids)))
    .returns<Array<{ id: string; name: string }>>();

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((item) => [item.id, item.name]));
}

async function getEstablishments(ids: string[]) {
  if (!ids.length) {
    return new Map<string, { tradeName: string; whatsapp: string | null; instagram: string | null; profilePhotoUrl: string | null }>();
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("EstablishmentProfile")
    .select("*")
    .in("id", Array.from(new Set(ids)))
    .returns<
      Array<{
        id: string;
        tradeName: string;
        whatsapp: string | null;
        instagram: string | null;
        profilePhotoUrl: string | null;
        [key: string]: unknown;
      }>
    >();

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((item) => [
      item.id,
      {
        tradeName: item.tradeName,
        whatsapp: item.whatsapp,
        instagram: item.instagram ?? null,
        profilePhotoUrl: item.profilePhotoUrl,
      },
    ]),
  );
}

async function getAcceptedApplicationCounts(jobPostIds: string[]) {
  if (!jobPostIds.length) return new Map<string, number>();

  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("JobApplication")
      .select("jobPostId")
      .in("jobPostId", Array.from(new Set(jobPostIds)))
      .eq("status", "ACCEPTED")
      .returns<Array<{ jobPostId: string }>>();

    if (error) {
      console.error("[getAcceptedApplicationCounts] Supabase error:", error);
      throw error;
    }

    const counts = new Map<string, number>();

    (data ?? []).forEach((item) => {
      counts.set(item.jobPostId, (counts.get(item.jobPostId) ?? 0) + 1);
    });

    return counts;
  } catch (err) {
    console.error("[getAcceptedApplicationCounts] Exception:", err);
    return new Map<string, number>();
  }
}

async function getTotalApplicationCounts(jobPostIds: string[]) {
  if (!jobPostIds.length) return new Map<string, number>();

  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("JobApplication")
      .select("jobPostId")
      .in("jobPostId", Array.from(new Set(jobPostIds)))
      .returns<Array<{ jobPostId: string }>>();

    if (error) {
      console.error("[getTotalApplicationCounts] Supabase error:", error);
      throw error;
    }

    const counts = new Map<string, number>();

    (data ?? []).forEach((item) => {
      counts.set(item.jobPostId, (counts.get(item.jobPostId) ?? 0) + 1);
    });

    return counts;
  } catch (err) {
    console.error("[getTotalApplicationCounts] Exception:", err);
    return new Map<string, number>();
  }
}

export async function getJobPostById(jobPostId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .eq("id", jobPostId)
    .maybeSingle<JobPost>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getJobPostsByEstablishment(establishmentId: string) {
  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("JobPost")
      .select("*")
      .eq("establishmentId", establishmentId)
      .order("createdAt", { ascending: false })
      .returns<JobPost[]>();

    if (error) {
      console.error("[getJobPostsByEstablishment] Supabase error:", error);
      throw error;
    }

    const jobs = data ?? [];
    const [acceptedCounts, totalCounts] = await Promise.all([
      getAcceptedApplicationCounts(jobs.map((job) => job.id)),
      getTotalApplicationCounts(jobs.map((job) => job.id)),
    ]);

    return jobs.map((job) => ({
      ...job,
      acceptedApplicationCount: acceptedCounts.get(job.id) ?? 0,
      totalApplicationCount: totalCounts.get(job.id) ?? 0,
    })) satisfies EstablishmentJobPost[];
  } catch (err) {
    console.error("[getJobPostsByEstablishment] Exception:", err);
    throw err;
  }
}

export async function getOpenJobPosts(filters: OpenJobFilters = {}) {
  let query = getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .eq("status", "OPEN")
    .order("workDate", { ascending: true });

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.neighborhood) {
    query = query.ilike("neighborhood", `%${filters.neighborhood}%`);
  }

  if (filters.specialtyId) {
    query = query.eq("specialtyId", filters.specialtyId);
  }

  const { data, error } = await query.returns<JobPost[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).filter(isFutureOrTodayJob);
}

export async function getOpenJobListings(input: {
  freelancerId?: string;
  filters?: OpenJobFilters;
}) {
  const jobs = await getOpenJobPosts(input.filters);
  const [establishments, specialtyNames] = await Promise.all([
    getEstablishments(jobs.map((job) => job.establishmentId)),
    getSpecialtyNames(jobs.map((job) => job.specialtyId)),
  ]);

  let applications = new Map<string, string>();

  if (input.freelancerId && jobs.length) {
    const { data, error } = await getSupabaseAdminClient()
      .from("JobApplication")
      .select("jobPostId,status")
      .eq("freelancerId", input.freelancerId)
      .in("jobPostId", jobs.map((job) => job.id))
      .returns<Array<{ jobPostId: string; status: string }>>();

    if (error) {
      throw error;
    }

    applications = new Map((data ?? []).map((item) => [item.jobPostId, item.status]));
  }

  return jobs.map((job) => ({
    ...job,
    establishmentName: establishments.get(job.establishmentId)?.tradeName ?? "Estabelecimento",
    establishmentPhotoUrl: establishments.get(job.establishmentId)?.profilePhotoUrl ?? null,
    specialtyName: specialtyNames.get(job.specialtyId) ?? "Especialidade",
    applicationStatus: applications.get(job.id) ?? null,
  }));
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

export async function createJobApplication(input: {
  jobPostId: string;
  freelancerId: string;
  message?: string | null;
}) {
  const job = await getJobPostById(input.jobPostId);

  if (!job || job.status !== "OPEN" || !isFutureOrTodayJob(job)) {
    throw new Error("Esta vaga nao esta mais aberta.");
  }

  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("JobApplication")
    .insert({
      id: randomUUID(),
      jobPostId: input.jobPostId,
      freelancerId: input.freelancerId,
      message: input.message || null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    })
    .select("*")
    .single<JobApplication>();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Voce ja se candidatou a esta vaga.");
    }

    throw error;
  }

  return data;
}

export async function getFreelancerApplications(freelancerId: string) {
  const { data: applications, error } = await getSupabaseAdminClient()
    .from("JobApplication")
    .select("*")
    .eq("freelancerId", freelancerId)
    .order("createdAt", { ascending: false })
    .returns<JobApplication[]>();

  if (error) {
    throw error;
  }

  const apps = applications ?? [];
  const jobIds = apps.map((item) => item.jobPostId);

  if (!jobIds.length) {
    return [];
  }

  const { data: jobs, error: jobsError } = await getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .in("id", jobIds)
    .returns<JobPost[]>();

  if (jobsError) {
    throw jobsError;
  }

  const jobById = new Map((jobs ?? []).map((job) => [job.id, job]));
  const [establishments, specialtyNames] = await Promise.all([
    getEstablishments((jobs ?? []).map((job) => job.establishmentId)),
    getSpecialtyNames((jobs ?? []).map((job) => job.specialtyId)),
  ]);

  return apps
    .map((application) => {
      const job = jobById.get(application.jobPostId);

      if (!job) {
        return null;
      }

      const establishment = establishments.get(job.establishmentId);

      return {
        ...application,
        job,
        establishmentName: establishment?.tradeName ?? "Estabelecimento",
        establishmentPhotoUrl: establishment?.profilePhotoUrl ?? null,
        establishmentWhatsapp:
          application.status === "ACCEPTED" ? establishment?.whatsapp ?? null : null,
        establishmentInstagram:
          application.status === "ACCEPTED" ? establishment?.instagram ?? null : null,
        specialtyName: specialtyNames.get(job.specialtyId) ?? "Especialidade",
      };
    })
    .filter((item): item is FreelancerApplicationListing => Boolean(item));
}

export async function getApplicationsByJobForEstablishment(input: {
  jobPostId: string;
  establishmentId: string;
}) {
  const job = await getJobPostById(input.jobPostId);

  if (!job || job.establishmentId !== input.establishmentId) {
    throw new Error("Vaga nao encontrada.");
  }

  const { data: applications, error } = await getSupabaseAdminClient()
    .from("JobApplication")
    .select("*")
    .eq("jobPostId", input.jobPostId)
    .order("createdAt", { ascending: false })
    .returns<JobApplication[]>();

  if (error) {
    throw error;
  }

  const apps = applications ?? [];
  const freelancerIds = apps.map((item) => item.freelancerId);

  if (!freelancerIds.length) {
    return { job, applications: [] as EstablishmentApplicationListing[] };
  }

  const { data: freelancers, error: freelancersError } = await getSupabaseAdminClient()
    .from("FreelancerProfile")
    .select("*")
    .in("id", freelancerIds)
    .returns<
      Array<{
        id: string;
        fullName: string;
        email: string | null;
        whatsapp: string | null;
        instagram: string | null;
        profilePhotoUrl: string | null;
        city: string | null;
        neighborhood: string | null;
        bio: string | null;
        experience: string | null;
        [key: string]: unknown;
      }>
    >();

  if (freelancersError) {
    throw freelancersError;
  }

  const freelancerById = new Map((freelancers ?? []).map((item) => [item.id, item]));
  const { data: freelancerSpecialties, error: specialtiesError } =
    await getSupabaseAdminClient()
      .from("FreelancerSpecialty")
      .select("freelancerId,specialtyId")
      .in("freelancerId", freelancerIds)
      .returns<Array<{ freelancerId: string; specialtyId: string }>>();

  if (specialtiesError) {
    throw specialtiesError;
  }

  const specialtyNames = await getSpecialtyNames(
    (freelancerSpecialties ?? []).map((item) => item.specialtyId),
  );
  const specialtiesByFreelancer = new Map<string, string[]>();

  (freelancerSpecialties ?? []).forEach((item) => {
    const list = specialtiesByFreelancer.get(item.freelancerId) ?? [];
    const name = specialtyNames.get(item.specialtyId);

    if (name) {
      list.push(name);
    }

    specialtiesByFreelancer.set(item.freelancerId, list);
  });

  return {
    job,
    applications: apps
      .map((application) => {
        const freelancer = freelancerById.get(application.freelancerId);

        if (!freelancer) {
          return null;
        }

        return {
          ...application,
          job,
          freelancer: {
            ...freelancer,
            whatsapp: application.status === "ACCEPTED" ? freelancer.whatsapp : null,
            // instagram is always visible — freelancer's social is public
            instagram: freelancer.instagram,
            specialties: specialtiesByFreelancer.get(freelancer.id) ?? [],
          },
        };
      })
      .filter((item): item is EstablishmentApplicationListing => Boolean(item)),
  };
}

export async function updateApplicationStatusForEstablishment(input: {
  applicationId: string;
  establishmentId: string;
  status: "ACCEPTED" | "REJECTED";
}) {
  const { data: application, error: applicationError } = await getSupabaseAdminClient()
    .from("JobApplication")
    .select("*")
    .eq("id", input.applicationId)
    .single<JobApplication>();

  if (applicationError) {
    throw applicationError;
  }

  const job = await getJobPostById(application.jobPostId);

  if (!job || job.establishmentId !== input.establishmentId) {
    throw new Error("Candidatura nao encontrada.");
  }

  // Enforce quantity limit before accepting
  if (input.status === "ACCEPTED" && application.status !== "ACCEPTED") {
    const counts = await getAcceptedApplicationCounts([job.id]);
    if ((counts.get(job.id) ?? 0) >= job.quantity) {
      throw new Error("Esta vaga ja atingiu o numero maximo de candidatos aceitos.");
    }
  }

  const now = new Date().toISOString();
  const { error } = await getSupabaseAdminClient()
    .from("JobApplication")
    .update({
      status: input.status,
      acceptedAt: input.status === "ACCEPTED" ? now : null,
      rejectedAt: input.status === "REJECTED" ? now : null,
      updatedAt: now,
    })
    .eq("id", input.applicationId);

  if (error) {
    throw error;
  }

  if (input.status === "REJECTED" && job.status === "FINISHED") {
    const acceptedCounts = await getAcceptedApplicationCounts([job.id]);

    if ((acceptedCounts.get(job.id) ?? 0) === 0 && isFutureOrTodayJob(job)) {
      const { error: reopenError } = await getSupabaseAdminClient()
        .from("JobPost")
        .update({
          status: "OPEN",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("establishmentId", input.establishmentId);

      if (reopenError) {
        throw reopenError;
      }
    }
  }
}

export async function deleteJobPostForEstablishment(input: {
  jobPostId: string;
  establishmentId: string;
}) {
  const acceptedCounts = await getAcceptedApplicationCounts([input.jobPostId]);

  if ((acceptedCounts.get(input.jobPostId) ?? 0) > 0) {
    await closeJobPostForEstablishment(input);
    return;
  }

  const { error } = await getSupabaseAdminClient()
    .from("JobPost")
    .delete()
    .eq("id", input.jobPostId)
    .eq("establishmentId", input.establishmentId);

  if (error) {
    throw error;
  }
}

export async function closeJobPostForEstablishment(input: {
  jobPostId: string;
  establishmentId: string;
}) {
  const { error } = await getSupabaseAdminClient()
    .from("JobPost")
    .update({
      status: "FINISHED",
      updatedAt: new Date().toISOString(),
    })
    .eq("id", input.jobPostId)
    .eq("establishmentId", input.establishmentId);

  if (error) {
    throw error;
  }
}

export async function getOpenJobListingsPaged(input: {
  freelancerId?: string;
  filters?: OpenJobFilters;
  page?: number;
}): Promise<JobListingsPageResult> {
  const page = Math.max(1, input.page ?? 1);
  let query = getSupabaseAdminClient()
    .from("JobPost")
    .select("*", { count: "exact" })
    .eq("status", "OPEN")
    .order("workDate", { ascending: true })
    .range((page - 1) * JOBS_PAGE_SIZE, page * JOBS_PAGE_SIZE - 1);

  if (input.filters?.city) {
    query = query.ilike("city", `%${input.filters.city}%`);
  }

  if (input.filters?.neighborhood) {
    query = query.ilike("neighborhood", `%${input.filters.neighborhood}%`);
  }

  if (input.filters?.specialtyId) {
    query = query.eq("specialtyId", input.filters.specialtyId);
  }

  const { data, error, count } = await query.returns<JobPost[]>();

  if (error) {
    throw error;
  }

  const jobs = (data ?? []).filter(isFutureOrTodayJob);
  const total = count ?? 0;

  const [establishments, specialtyNames] = await Promise.all([
    getEstablishments(jobs.map((job) => job.establishmentId)),
    getSpecialtyNames(jobs.map((job) => job.specialtyId)),
  ]);

  let applications = new Map<string, string>();

  if (input.freelancerId && jobs.length) {
    const { data: appData, error: appError } = await getSupabaseAdminClient()
      .from("JobApplication")
      .select("jobPostId,status")
      .eq("freelancerId", input.freelancerId)
      .in("jobPostId", jobs.map((job) => job.id))
      .returns<Array<{ jobPostId: string; status: string }>>();

    if (appError) {
      throw appError;
    }

    applications = new Map((appData ?? []).map((item) => [item.jobPostId, item.status]));
  }

  return {
    items: jobs.map((job) => ({
      ...job,
      establishmentName: establishments.get(job.establishmentId)?.tradeName ?? "Estabelecimento",
      establishmentPhotoUrl: establishments.get(job.establishmentId)?.profilePhotoUrl ?? null,
      specialtyName: specialtyNames.get(job.specialtyId) ?? "Especialidade",
      applicationStatus: applications.get(job.id) ?? null,
    })),
    total,
    page,
    pageSize: JOBS_PAGE_SIZE,
    totalPages: Math.ceil(total / JOBS_PAGE_SIZE),
  };
}

export async function getJobPostsByEstablishmentPaged(
  establishmentId: string,
  page?: number,
): Promise<EstablishmentJobPostsPageResult> {
  const pageNum = Math.max(1, page ?? 1);

  try {
    const { data, error, count } = await getSupabaseAdminClient()
      .from("JobPost")
      .select("*", { count: "exact" })
      .eq("establishmentId", establishmentId)
      .order("createdAt", { ascending: false })
      .range((pageNum - 1) * JOBS_PAGE_SIZE, pageNum * JOBS_PAGE_SIZE - 1)
      .returns<JobPost[]>();

    if (error) {
      console.error("[getJobPostsByEstablishmentPaged] Supabase error:", error);
      throw error;
    }

    const jobs = data ?? [];
    const total = count ?? 0;

    const [acceptedCounts, totalCounts] = await Promise.all([
      getAcceptedApplicationCounts(jobs.map((job) => job.id)),
      getTotalApplicationCounts(jobs.map((job) => job.id)),
    ]);

    return {
      items: jobs.map((job) => ({
        ...job,
        acceptedApplicationCount: acceptedCounts.get(job.id) ?? 0,
        totalApplicationCount: totalCounts.get(job.id) ?? 0,
      })),
      total,
      page: pageNum,
      pageSize: JOBS_PAGE_SIZE,
      totalPages: Math.ceil(total / JOBS_PAGE_SIZE),
    };
  } catch (err) {
    console.error("[getJobPostsByEstablishmentPaged] Exception:", err);
    throw err;
  }
}

export async function getFreelancerApplicationsPaged(
  freelancerId: string,
  page?: number,
): Promise<FreelancerApplicationsPageResult> {
  const pageNum = Math.max(1, page ?? 1);
  const { data: applications, error, count } = await getSupabaseAdminClient()
    .from("JobApplication")
    .select("*", { count: "exact" })
    .eq("freelancerId", freelancerId)
    .order("createdAt", { ascending: false })
    .range((pageNum - 1) * JOBS_PAGE_SIZE, pageNum * JOBS_PAGE_SIZE - 1)
    .returns<JobApplication[]>();

  if (error) {
    throw error;
  }

  const apps = applications ?? [];
  const total = count ?? 0;
  const jobIds = apps.map((item) => item.jobPostId);

  if (!jobIds.length) {
    return { items: [], total, page: pageNum, pageSize: JOBS_PAGE_SIZE, totalPages: Math.ceil(total / JOBS_PAGE_SIZE) };
  }

  const { data: jobs, error: jobsError } = await getSupabaseAdminClient()
    .from("JobPost")
    .select("*")
    .in("id", jobIds)
    .returns<JobPost[]>();

  if (jobsError) {
    throw jobsError;
  }

  const jobById = new Map((jobs ?? []).map((job) => [job.id, job]));
  const [establishments, specialtyNames] = await Promise.all([
    getEstablishments((jobs ?? []).map((job) => job.establishmentId)),
    getSpecialtyNames((jobs ?? []).map((job) => job.specialtyId)),
  ]);

  return {
    items: apps
      .map((application) => {
        const job = jobById.get(application.jobPostId);

        if (!job) {
          return null;
        }

        const establishment = establishments.get(job.establishmentId);

        return {
          ...application,
          job,
          establishmentName: establishment?.tradeName ?? "Estabelecimento",
          establishmentPhotoUrl: establishment?.profilePhotoUrl ?? null,
          establishmentWhatsapp:
            application.status === "ACCEPTED" ? establishment?.whatsapp ?? null : null,
          establishmentInstagram:
            application.status === "ACCEPTED" ? establishment?.instagram ?? null : null,
          specialtyName: specialtyNames.get(job.specialtyId) ?? "Especialidade",
        };
      })
      .filter((item): item is FreelancerApplicationListing => Boolean(item)),
    total,
    page: pageNum,
    pageSize: JOBS_PAGE_SIZE,
    totalPages: Math.ceil(total / JOBS_PAGE_SIZE),
  };
}
