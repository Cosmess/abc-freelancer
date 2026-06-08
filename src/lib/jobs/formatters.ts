import type { JobPost } from "@/lib/jobs/job-store";

const applicationStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluida",
};

const jobStatusLabels: Record<string, string> = {
  OPEN: "Aberta",
  IN_REVIEW: "Em analise",
  FILLED: "Preenchida",
  CANCELLED: "Cancelada",
  FINISHED: "Encerrada",
};

export function getApplicationStatusLabel(status: string | null | undefined) {
  if (!status) return "";

  return applicationStatusLabels[status] ?? status;
}

export function getJobStatusLabel(status: string | null | undefined) {
  if (!status) return "";

  return jobStatusLabels[status] ?? status;
}

export function formatJobAddress(job: JobPost) {
  return [
    [job.street, job.number].filter(Boolean).join(", "),
    job.neighborhood,
    job.city,
    job.cep ? `CEP ${job.cep}` : null,
  ]
    .filter(Boolean)
    .join(" - ");
}

export function getJobMapsUrl(job: JobPost) {
  const address = formatJobAddress(job);

  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function formatJobSchedule(job: JobPost) {
  return `${new Date(job.workDate).toLocaleDateString("pt-BR")} das ${job.startTime} as ${job.endTime}`;
}

export function getWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (!digits) return null;

  const number = digits.startsWith("55") ? digits : `55${digits}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getFreelancerToEstablishmentMessage(input: {
  freelancerName: string;
  jobTitle: string;
}) {
  return `Ola me chamo: ${input.freelancerName}, estou entrando em contato referente a vaga de ${input.jobTitle} postada no ABC Freelancer.`;
}

export function getEstablishmentToFreelancerMessage(input: {
  establishmentName: string;
  job: JobPost;
}) {
  return [
    `Ola somos do ${input.establishmentName}, seu perfil chamou a atencao para a vaga ${input.job.title}.`,
    `Dia e horario: ${formatJobSchedule(input.job)}.`,
    `Endereco: ${formatJobAddress(input.job)}.`,
    `Valor: R$ ${(input.job.paymentValue / 100).toFixed(2).replace(".", ",")}.`,
  ].join(" ");
}
