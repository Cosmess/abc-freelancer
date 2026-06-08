import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.");

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
  whatsapp: z.string().optional(),
  city: z.string().min(2, "Informe sua cidade.").trim(),
  neighborhood: z.string().optional(),
  cpf: z.string().optional(),
});

export const establishmentSignupSchema = z.object({
  responsibleName: z.string().min(2, "Informe o nome do responsavel.").trim(),
  tradeName: z.string().min(2, "Informe o nome do estabelecimento.").trim(),
  email: z.email("Informe um email valido.").trim().toLowerCase(),
  password: passwordSchema,
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  cnpj: z.string().min(14, "Informe o CNPJ.").trim(),
  city: z.string().min(2, "Informe a cidade.").trim(),
  neighborhood: z.string().optional(),
});

export type AuthActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
};
