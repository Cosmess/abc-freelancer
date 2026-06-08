"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createJobPost } from "@/lib/jobs/job-store";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { jobPostSchema, type ProfileActionState } from "@/lib/profiles/validators";
import { requireEstablishment } from "@/server/guards/auth";

function flattenErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

function cleanDocument(value: string | undefined): string | undefined {
  return value?.replace(/\D/g, "");
}

export async function createJobPostAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireEstablishment();
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
      cep: cleanDocument(parsed.data.cep),
      paymentValue: Math.round(parsed.data.paymentValue * 100),
    });
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel criar a vaga.",
    };
  }

  revalidatePath("/app/estabelecimento/vagas");
  redirect("/app/estabelecimento/vagas");
}
