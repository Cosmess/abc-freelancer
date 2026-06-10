import { z } from "zod";

const passwordSchema = z
  .string()
  .min(10, "A senha deve ter pelo menos 10 caracteres.")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um numero.");

const termsSchema = z
  .literal("true")
  .refine((v) => v === "true", "Voce precisa aceitar os Termos de Uso para continuar.");

export const loginSchema = z.object({
  email: z.email("Informe um email valido.").trim().toLowerCase(),
  password: z.string().min(1, "Informe sua senha."),
});

export const resendVerificationSchema = z.object({
  email: z.email("Informe um email valido.").trim().toLowerCase(),
});

export const freelancerSignupSchema = z.object({
  fullName: z.string().min(2, "Informe seu nome completo.").trim(),
  email: z.email("Informe um email valido.").trim().toLowerCase(),
  password: passwordSchema,
  phone: z.string().optional(),
  city: z.string().min(2, "Informe sua cidade.").trim(),
  neighborhood: z.string().optional(),
  termsAccepted: termsSchema,
});

export const establishmentSignupSchema = z.object({
  responsibleName: z.string().min(2, "Informe o nome do responsavel.").trim(),
  tradeName: z.string().min(2, "Informe o nome do estabelecimento.").trim(),
  email: z.email("Informe um email valido.").trim().toLowerCase(),
  password: passwordSchema,
  phone: z.string().optional(),
  city: z.string().min(2, "Informe a cidade.").trim(),
  neighborhood: z.string().optional(),
  termsAccepted: termsSchema,
});

export type AuthActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
  // Set when login fails specifically because the email is not yet verified
  emailNotVerified?: boolean;
  // The email the user attempted to login with (echoed for pre-filling resend form)
  email?: string;
};
