"use server";

import { revalidatePath } from "next/cache";

import {
  establishmentProfileSchema,
  freelancerProfileSchema,
  type ProfileActionState,
} from "@/lib/profiles/validators";
import {
  updateUserBasics,
  replaceFreelancerAvailability,
  replaceFreelancerSpecialties,
  upsertEstablishmentProfile,
  upsertFreelancerProfile,
} from "@/lib/profiles/profile-store";
import { uploadProfilePhoto } from "@/lib/storage/profile-photos";
import { requireEstablishment, requireFreelancer } from "@/server/guards/auth";

function flattenErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

function cleanDocument(value: string | undefined): string | undefined {
  return value?.replace(/\D/g, "");
}

function parseAvailability(formData: FormData) {
  return formData
    .getAll("availability")
    .map(String)
    .map((value) => {
      const [dayOfWeek, shift] = value.split(":");
      return { dayOfWeek, shift };
    })
    .filter((item) => item.dayOfWeek && item.shift);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return "Nao foi possivel salvar o perfil.";
}

async function uploadProfilePhotoFromForm(input: {
  formData: FormData;
  ownerId: string;
  folder: "freelancers" | "establishments";
}) {
  const file = input.formData.get("profilePhotoFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return uploadProfilePhoto({
    file,
    ownerId: input.ownerId,
    folder: input.folder,
  });
}

export async function updateFreelancerProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireFreelancer();
  const parsed = freelancerProfileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  try {
    const profilePhotoUrl = await uploadProfilePhotoFromForm({
      formData,
      ownerId: user.id,
      folder: "freelancers",
    });
    await updateUserBasics({
      userId: user.id,
      name: parsed.data.fullName,
      phone: parsed.data.phone,
    });
    const profile = await upsertFreelancerProfile({
      userId: user.id,
      fullName: parsed.data.fullName,
      whatsapp: parsed.data.whatsapp,
      ...(parsed.data.instagram ? { instagram: parsed.data.instagram } : {}),
      email: parsed.data.email,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
      street: parsed.data.street,
      cep: cleanDocument(parsed.data.cep),
      bio: parsed.data.bio,
      experience: parsed.data.experience,
      profilePhotoUrl: profilePhotoUrl ?? parsed.data.profilePhotoUrl,
    });
    await replaceFreelancerSpecialties({
      freelancerId: profile.id,
      specialtyIds: formData.getAll("specialtyIds").map(String),
    });
    await replaceFreelancerAvailability({
      freelancerId: profile.id,
      preferences: parseAvailability(formData),
    });
  } catch (error) {
    return { message: getErrorMessage(error) };
  }

  revalidatePath("/app/freelancer");
  revalidatePath("/app/freelancer/perfil");

  return { success: true, message: "Perfil salvo." };
}

export async function updateEstablishmentProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireEstablishment();
  const parsed = establishmentProfileSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  try {
    const profilePhotoUrl = await uploadProfilePhotoFromForm({
      formData,
      ownerId: user.id,
      folder: "establishments",
    });
    await updateUserBasics({
      userId: user.id,
      name: parsed.data.responsibleName,
      phone: parsed.data.phone,
    });
    await upsertEstablishmentProfile({
      userId: user.id,
      tradeName: parsed.data.tradeName,
      legalName: parsed.data.legalName,
      whatsapp: parsed.data.whatsapp,
      ...(parsed.data.instagram ? { instagram: parsed.data.instagram } : {}),
      email: parsed.data.email,
      type: parsed.data.type,
      description: parsed.data.description,
      profilePhotoUrl: profilePhotoUrl ?? parsed.data.profilePhotoUrl,
      cep: cleanDocument(parsed.data.cep),
      state: parsed.data.state,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
      street: parsed.data.street,
      number: parsed.data.number,
      complement: parsed.data.complement,
    });
  } catch (error) {
    return { message: getErrorMessage(error) };
  }

  revalidatePath("/app/estabelecimento");
  revalidatePath("/app/estabelecimento/perfil");

  return { success: true, message: "Perfil salvo." };
}
