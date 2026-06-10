"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import {
  confirmAuthEmailIfInternallyVerified,
  createInternalEstablishmentUser,
  createInternalFreelancerUser,
  findAuthUserByEmail,
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
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function flattenErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return error.flatten().fieldErrors;
}

async function assertEmailAvailable(email: string): Promise<AuthActionState | null> {
  const existing = await findInternalUserByEmail(email);

  if (existing) {
    // Generic message to prevent email enumeration
    return { message: "Este email ja esta em uso. Faca login ou use outro email." };
  }

  const authUser = await findAuthUserByEmail(email);

  if (authUser) {
    // Same generic message — do not reveal which system holds the email
    return { message: "Este email ja esta em uso. Faca login ou use outro email." };
  }

  return null;
}

function getAuthErrorMessage(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message).toLowerCase()
        : "";

  if (msg.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (msg.includes("email already") || msg.includes("duplicate") || msg.includes("already registered")) {
    return "Este email ja esta em uso.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "Email invalido.";
  }
  if (msg.includes("expired") || msg.includes("invalid token")) {
    return "Codigo invalido ou expirado.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Erro de conexao. Tente novamente.";
  }

  // Do not return raw internal error messages to the client
  return "Nao foi possivel concluir a operacao agora.";
}

async function createPendingAuthUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  const { data, error } = await getSupabaseAdminClient().auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: false,
    user_metadata: {
      name: input.name,
      role: input.role,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Nao foi possivel criar sua conta.");
  }

  return data.user;
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
  let { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error?.message.toLowerCase().includes("email not confirmed")) {
    try {
      const confirmed = await confirmAuthEmailIfInternallyVerified(
        parsed.data.email,
      );

      if (confirmed) {
        const retry = await supabase.auth.signInWithPassword(parsed.data);
        data = retry.data;
        error = retry.error;
      }
    } catch {
      return {
        message:
          "Nao foi possivel sincronizar a validacao manual do email agora.",
      };
    }
  }

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("email not confirmed")) {
      return {
        message: "Seu email ainda nao foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link de verificacao.",
        emailNotVerified: true,
        email: parsed.data.email,
      };
    }

    return { message: "Email ou senha invalidos." };
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return {
      message: "Seu email ainda nao foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link de verificacao.",
      emailNotVerified: true,
      email: parsed.data.email,
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
    if (error.message.toLowerCase().includes("rate limit")) {
      return {
        message:
          "O Supabase limitou o envio de emails por agora. Aguarde alguns minutos e tente reenviar novamente.",
      };
    }

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

  let authUserId: string;

  try {
    const authUser = await createPendingAuthUser({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.fullName,
      role: UserRole.FREELANCER,
    });
    authUserId = authUser.id;
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
  }

  try {
    await createInternalFreelancerUser({
      supabaseAuthUserId: authUserId,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
      termsAcceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    await getSupabaseAdminClient().auth.admin.deleteUser(authUserId);
    return { message: getAuthErrorMessage(error) };
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

  let authUserId: string;

  try {
    const authUser = await createPendingAuthUser({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.responsibleName,
      role: UserRole.ESTABLISHMENT,
    });
    authUserId = authUser.id;
  } catch (error) {
    return { message: getAuthErrorMessage(error) };
  }

  try {
    await createInternalEstablishmentUser({
      supabaseAuthUserId: authUserId,
      email: parsed.data.email,
      responsibleName: parsed.data.responsibleName,
      phone: parsed.data.phone,
      tradeName: parsed.data.tradeName,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
      termsAcceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    await getSupabaseAdminClient().auth.admin.deleteUser(authUserId);
    return { message: getAuthErrorMessage(error) };
  }

  redirect("/auth/confirmar-email");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
