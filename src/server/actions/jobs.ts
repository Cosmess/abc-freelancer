"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  createJobApplication,
  createJobPost,
  closeJobPostForEstablishment,
  deleteJobPostForEstablishment,
  updateApplicationStatusForEstablishment,
} from "@/lib/jobs/job-store";
import {
  getEstablishmentProfile,
  getFreelancerProfile,
} from "@/lib/profiles/profile-store";
import { jobPostSchema, type ProfileActionState } from "@/lib/profiles/validators";
import { requireActiveAccess, requireEstablishment, requireFreelancer } from "@/server/guards/auth";
import { logError } from "@/lib/logger";

function flattenErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

export async function createJobPostAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireEstablishment();
  await requireActiveAccess(user);
  const profile = await getEstablishmentProfile(user.id);

  if (!profile) {
    return { message: "Complete o perfil do estabelecimento antes de criar vagas." };
  }

  const parsed = jobPostSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  try {
    await createJobPost({
      establishmentId: profile.id,
      ...parsed.data,
      // Use establishment profile address automatically
      city: profile.city || "",
      neighborhood: profile.neighborhood || undefined,
      street: profile.street || undefined,
      number: profile.number || undefined,
      cep: profile.cep || undefined,
      paymentValue: Math.round(parsed.data.paymentValue * 100),
    });
  } catch (error) {
    logError("createJobPost error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { message: "Nao foi possivel criar a vaga." };
  }

  revalidatePath("/app/estabelecimento/vagas");
  redirect("/app/estabelecimento/vagas");
}

export async function applyToJobAction(jobPostId: string, formData: FormData) {
  const user = await requireFreelancer();
  await requireActiveAccess(user);
  const profile = await getFreelancerProfile(user.id);

  if (!profile) {
    redirect("/app/freelancer/perfil");
  }

  await createJobApplication({
    jobPostId,
    freelancerId: profile.id,
    message: formData.get("message")?.toString(),
  });

  revalidatePath("/vagas");
  revalidatePath("/app/freelancer/candidaturas");
  redirect("/app/freelancer/candidaturas");
}

export async function deleteJobPostAction(jobPostId: string) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  if (!profile) {
    redirect("/app/estabelecimento/perfil");
  }

  await deleteJobPostForEstablishment({
    jobPostId,
    establishmentId: profile.id,
  });

  revalidatePath("/vagas");
  revalidatePath("/app/estabelecimento/vagas");
  revalidatePath("/app/freelancer/candidaturas");
}

export async function closeJobPostAction(jobPostId: string) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  if (!profile) {
    redirect("/app/estabelecimento/perfil");
  }

  await closeJobPostForEstablishment({
    jobPostId,
    establishmentId: profile.id,
  });

  revalidatePath("/vagas");
  revalidatePath("/app/estabelecimento/vagas");
  revalidatePath("/app/freelancer/candidaturas");
}

export async function acceptApplicationAction(applicationId: string, jobPostId: string) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  if (!profile) {
    redirect("/app/estabelecimento/perfil");
  }

  await updateApplicationStatusForEstablishment({
    applicationId,
    establishmentId: profile.id,
    status: "ACCEPTED",
  });

  revalidatePath("/vagas");
  revalidatePath(`/app/estabelecimento/vagas/${jobPostId}/candidatos`);
  revalidatePath("/app/freelancer/candidaturas");
  redirect(`/app/estabelecimento/vagas/${jobPostId}/candidatos`);
}

export async function rejectApplicationAction(applicationId: string, jobPostId: string) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  if (!profile) {
    redirect("/app/estabelecimento/perfil");
  }

  await updateApplicationStatusForEstablishment({
    applicationId,
    establishmentId: profile.id,
    status: "REJECTED",
  });

  revalidatePath("/vagas");
  revalidatePath(`/app/estabelecimento/vagas/${jobPostId}/candidatos`);
  revalidatePath("/app/freelancer/candidaturas");
  redirect(`/app/estabelecimento/vagas/${jobPostId}/candidatos`);
}
