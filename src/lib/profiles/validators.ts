import { z } from "zod";

const optionalText = z.string().trim().optional();

export const freelancerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo."),
  phone: optionalText,
  cpf: optionalText,
  whatsapp: optionalText,
  email: z.email("Informe um email valido.").trim().optional().or(z.literal("")),
  city: optionalText,
  neighborhood: optionalText,
  street: optionalText,
  cep: optionalText,
  bio: optionalText,
  experience: optionalText,
  profilePhotoUrl: optionalText,
});

export const establishmentProfileSchema = z.object({
  responsibleName: z.string().trim().min(2, "Informe o responsavel."),
  phone: optionalText,
  tradeName: z.string().trim().min(2, "Informe o nome do estabelecimento."),
  legalName: optionalText,
  cnpj: z.string().trim().min(14, "Informe o CNPJ."),
  whatsapp: optionalText,
  email: z.email("Informe um email valido.").trim().optional().or(z.literal("")),
  type: optionalText,
  description: optionalText,
  profilePhotoUrl: optionalText,
  cep: optionalText,
  state: optionalText,
  city: optionalText,
  neighborhood: optionalText,
  street: optionalText,
  number: optionalText,
  complement: optionalText,
});

export type ProfileActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
};

export const jobPostSchema = z.object({
  title: z.string().trim().min(3, "Informe o titulo da vaga."),
  description: optionalText,
  specialtyId: z.string().trim().min(1, "Selecione uma especialidade."),
  city: z.string().trim().min(2, "Informe a cidade."),
  neighborhood: optionalText,
  street: optionalText,
  number: optionalText,
  cep: optionalText,
  workDate: z.string().trim().min(10, "Informe a data."),
  startTime: z.string().trim().min(4, "Informe o inicio."),
  endTime: z.string().trim().min(4, "Informe o fim."),
  paymentType: z.enum(["DAILY", "HOURLY", "FIXED"]),
  paymentValue: z.coerce.number().positive("Informe o valor."),
  quantity: z.coerce.number().int().min(1, "Informe a quantidade."),
  requirements: optionalText,
});
