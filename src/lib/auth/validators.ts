import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.");

// ---------------------------------------------------------------------------
// CPF validation (dígito verificador)
// ---------------------------------------------------------------------------

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digit

  const calcDigit = (factor: number) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) {
      sum += parseInt(digits[i]) * (factor - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder >= 10 ? 0 : remainder;
  };

  return calcDigit(10) === parseInt(digits[9]) && calcDigit(11) === parseInt(digits[10]);
}

// ---------------------------------------------------------------------------
// CNPJ validation (dígito verificador)
// ---------------------------------------------------------------------------

function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");

  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // all same digit

  const calcDigit = (weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  return (
    calcDigit(w1) === parseInt(digits[12]) &&
    calcDigit(w2) === parseInt(digits[13])
  );
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const cpfSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || !val.replace(/\D/g, "") || isValidCpf(val),
    "CPF invalido.",
  );

const cnpjSchema = z
  .string()
  .min(14, "Informe o CNPJ.")
  .trim()
  .refine((val) => isValidCnpj(val), "CNPJ invalido.");

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
  cpf: cpfSchema,
});

export const establishmentSignupSchema = z.object({
  responsibleName: z.string().min(2, "Informe o nome do responsavel.").trim(),
  tradeName: z.string().min(2, "Informe o nome do estabelecimento.").trim(),
  email: z.email("Informe um email valido.").trim().toLowerCase(),
  password: passwordSchema,
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  cnpj: cnpjSchema,
  city: z.string().min(2, "Informe a cidade.").trim(),
  neighborhood: z.string().optional(),
});

export type AuthActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
};
