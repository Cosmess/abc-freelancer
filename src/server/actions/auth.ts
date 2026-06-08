"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import {
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

function cleanDocument(value: string | undefined): string | undefined {
  return value?.replace(/\D/g, "");
}

async function assertEmailAvailable(email: string): Promise<AuthActionState | null> {
  const existing = await findInternalUserByEmail(email);

  if (existing) {
    return { message: "Este email ja esta cadastrado." };
  }

  const authUser = await findAuthUserByEmail(email);

  if (authUser) {
    return {
      message:
        "Este email ja existe no Supabase Auth. Se ainda nao confirmou, use o reenvio de verificacao; se ja confirmou, faca login.",
    };
  }

  return null;
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return "O Supabase limitou o envio de emails por agora. Aguarde alguns minutos e tente novamente.";
    }

    return error.message;
  }

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
      whatsapp: parsed.data.whatsapp,
      cpf: cleanDocument(parsed.data.cpf),
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
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
      tradeName: parsed.data.tradeName,
      whatsapp: parsed.data.whatsapp,
      cnpj: cleanDocument(parsed.data.cnpj) ?? parsed.data.cnpj,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
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
