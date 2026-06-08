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
