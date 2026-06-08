"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getAppUrl, getRoleHomePath } from "@/lib/auth/paths";
import {
  createInternalEstablishmentUser,
  createInternalFreelancerUser,
  syncInternalUserFromSupabaseUser,
} from "@/lib/auth/sync-user";
import {
  type AuthActionState,
  establishmentSignupSchema,
  freelancerSignupSchema,
  loginSchema,
} from "@/lib/auth/validators";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function flattenErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

function cleanDocument(value: string | undefined): string | undefined {
  return value?.replace(/\D/g, "");
}

async function assertEmailAvailable(email: string): Promise<AuthActionState | null> {
  const existing = await getPrisma().user.findUnique({ where: { email } });

  if (existing) {
    return { message: "Este email ja esta cadastrado." };
  }

  return null;
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { message: "Email ou senha invalidos." };
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return {
      message:
        "Confirme seu email pelo link enviado antes de acessar sua conta.",
    };
  }

  const user = await syncInternalUserFromSupabaseUser(data.user);
  redirect(getRoleHomePath(user.role));
}

export async function signupFreelancerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = freelancerSignupSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  const emailError = await assertEmailAvailable(parsed.data.email);
  if (emailError) {
    return emailError;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/app/freelancer`,
      data: {
        name: parsed.data.fullName,
        role: UserRole.FREELANCER,
      },
    },
  });

  if (error || !data.user) {
    return { message: error?.message ?? "Nao foi possivel criar sua conta." };
  }

  await createInternalFreelancerUser({
    supabaseAuthUserId: data.user.id,
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    whatsapp: parsed.data.whatsapp,
    cpf: cleanDocument(parsed.data.cpf),
    city: parsed.data.city,
    neighborhood: parsed.data.neighborhood,
  });

  if (data.session && data.user.email_confirmed_at) {
    await syncInternalUserFromSupabaseUser(data.user);
    redirect("/app/freelancer");
  }

  redirect("/auth/confirmar-email");
}

export async function signupEstablishmentAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = establishmentSignupSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  const emailError = await assertEmailAvailable(parsed.data.email);
  if (emailError) {
    return emailError;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/app/estabelecimento`,
      data: {
        name: parsed.data.responsibleName,
        role: UserRole.ESTABLISHMENT,
      },
    },
  });

  if (error || !data.user) {
    return { message: error?.message ?? "Nao foi possivel criar sua conta." };
  }

  await createInternalEstablishmentUser({
    supabaseAuthUserId: data.user.id,
    email: parsed.data.email,
    responsibleName: parsed.data.responsibleName,
    tradeName: parsed.data.tradeName,
    whatsapp: parsed.data.whatsapp,
    cnpj: cleanDocument(parsed.data.cnpj) ?? parsed.data.cnpj,
    city: parsed.data.city,
    neighborhood: parsed.data.neighborhood,
  });

  if (data.session && data.user.email_confirmed_at) {
    await syncInternalUserFromSupabaseUser(data.user);
    redirect("/app/estabelecimento");
  }

  redirect("/auth/confirmar-email");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
