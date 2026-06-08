"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import {
  createInternalEstablishmentUser,
  createInternalFreelancerUser,
  findInternalUserByEmail,
  syncInternalUserFromSupabaseUser,
} from "@/lib/auth/internal-user-store";
import { getAppUrl, getRoleHomePath } from "@/lib/auth/paths";
import {
  type AuthActionState,
  establishmentSignupSchema,
  freelancerSignupSchema,
  loginSchema,
  resendVerificationSchema,
} from "@/lib/auth/validators";
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
  const existing = await findInternalUserByEmail(email);

  if (existing) {
    return { message: "Este email ja esta cadastrado." };
  }

  return null;
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Nao foi possivel concluir a operacao agora.";
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

export async function resendVerificationEmailAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resendVerificationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { message: error.message };
  }

  return {
    success: true,
    message: "Email de verificacao reenviado. Verifique tambem spam e lixo eletronico.",
  };
}

export async function signupFreelancerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = freelancerSignupSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenErrors(parsed.error) };
  }

  try {
    const emailError = await assertEmailAvailable(parsed.data.email);
    if (emailError) {
      return emailError;
    }
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
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

  try {
    await createInternalFreelancerUser({
      supabaseAuthUserId: data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      whatsapp: parsed.data.whatsapp,
      cpf: cleanDocument(parsed.data.cpf),
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
    });
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
  }

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

  try {
    const emailError = await assertEmailAvailable(parsed.data.email);
    if (emailError) {
      return emailError;
    }
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
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

  try {
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
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
  }

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
