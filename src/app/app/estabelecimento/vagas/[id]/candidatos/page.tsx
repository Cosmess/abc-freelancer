import Link from "next/link";
import { ArrowLeft, Check, ClipboardList, MessageCircle, X } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  formatJobAddress,
  formatJobSchedule,
  getApplicationStatusLabel,
  getEstablishmentToFreelancerMessage,
  getInstagramUrl,
  getJobStatusLabel,
  getWhatsAppUrl,
} from "@/lib/jobs/formatters";
import { getApplicationsByJobForEstablishment } from "@/lib/jobs/job-store";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import {
  acceptApplicationAction,
  rejectApplicationAction,
} from "@/server/actions/jobs";
import { requireEstablishment } from "@/server/guards/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EstablishmentJobCandidatesPage({ params }: Props) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);
  const { id } = await params;

  if (!profile) {
    return (
      <main className="min-h-screen bg-muted/30 text-foreground">
        <AppHeader title="Candidatos" userName={user.name} />
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            Complete o perfil do estabelecimento antes de gerenciar candidatos.
          </div>
        </section>
      </main>
    );
  }

  const { job, applications } = await getApplicationsByJobForEstablishment({
    jobPostId: id,
    establishmentId: profile.id,
  });

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Candidatos" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-5 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">
              {job.title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Aceite uma candidatura para liberar o WhatsApp entre as partes.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatJobSchedule(job)} — {formatJobAddress(job)} —{" "}
              {getJobStatusLabel(job.status)}
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <RefreshButton />
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href="/app/estabelecimento/vagas">
                <ArrowLeft className="size-4" />
                Voltar para vagas
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          {applications.length ? (
            <div className="divide-y divide-border">
              {applications.map((application) => (
                <article key={application.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm font-semibold text-muted-foreground sm:size-14">
                        {application.freelancer.profilePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={application.freelancer.profilePhotoUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          application.freelancer.fullName.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{application.freelancer.fullName}</h2>
                          <span
                            className={[
                              "rounded-md px-2 py-0.5 text-xs font-medium",
                              application.status === "ACCEPTED"
                                ? "bg-primary/20 text-primary"
                                : application.status === "REJECTED"
                                  ? "bg-destructive/20 text-destructive-foreground"
                                  : "bg-muted text-muted-foreground border border-border",
                            ].join(" ")}
                          >
                            {getApplicationStatusLabel(application.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {application.freelancer.city ?? "Cidade nao informada"}
                          {application.freelancer.neighborhood
                            ? `, ${application.freelancer.neighborhood}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    {application.freelancer.specialties.length ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Especialidades:</span>{" "}
                        {application.freelancer.specialties.join(", ")}
                      </p>
                    ) : null}
                    {application.freelancer.bio ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {application.freelancer.bio}
                      </p>
                    ) : null}
                    {application.freelancer.experience ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        <span className="font-medium text-foreground">Experiencia:</span>{" "}
                        {application.freelancer.experience}
                      </p>
                    ) : null}
                    {application.freelancer.whatsapp ? (
                      <p className="mt-2 text-sm font-medium text-primary">
                        WhatsApp liberado: {application.freelancer.whatsapp}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-row lg:min-w-52 lg:flex-col lg:items-end">
                    {application.freelancer.instagram ? (
                      <Button asChild variant="outline" className="flex-1 sm:flex-none lg:w-full">
                        <a
                          href={getInstagramUrl(application.freelancer.instagram) ?? ""}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <InstagramIcon className="size-4" />
                          Instagram
                        </a>
                      </Button>
                    ) : null}
                    {application.freelancer.whatsapp ? (
                      <Button asChild className="flex-1 sm:flex-none lg:w-full">
                        <a
                          href={
                            getWhatsAppUrl(
                              application.freelancer.whatsapp,
                              getEstablishmentToFreelancerMessage({
                                establishmentName: profile.tradeName,
                                job,
                              }),
                            ) ?? ""
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="size-4" />
                          WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    {application.status !== "ACCEPTED" ? (
                      <form
                        action={acceptApplicationAction.bind(null, application.id, job.id)}
                        className="flex-1 sm:flex-none lg:w-full"
                      >
                        <Button type="submit" className="w-full">
                          <Check className="size-4" />
                          Aceitar
                        </Button>
                      </form>
                    ) : null}
                    {application.status !== "REJECTED" ? (
                      <form
                        action={rejectApplicationAction.bind(null, application.id, job.id)}
                        className="flex-1 sm:flex-none lg:w-full"
                      >
                        <Button type="submit" variant="destructive" className="w-full">
                          <X className="size-4" />
                          Recusar
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <ClipboardList className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-semibold">Nenhum candidato ainda</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Quando freelancers se candidatarem, os perfis aparecem aqui.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
