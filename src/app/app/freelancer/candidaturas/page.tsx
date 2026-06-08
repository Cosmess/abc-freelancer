import Link from "next/link";
import { ArrowLeft, ClipboardList, MapPin, MessageCircle } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  formatJobAddress,
  formatJobSchedule,
  getFreelancerToEstablishmentMessage,
  getApplicationStatusLabel,
  getJobStatusLabel,
  getJobMapsUrl,
  getWhatsAppUrl,
} from "@/lib/jobs/formatters";
import { getFreelancerApplications } from "@/lib/jobs/job-store";
import { getFreelancerProfile } from "@/lib/profiles/profile-store";
import { requireFreelancer } from "@/server/guards/auth";

export default async function FreelancerApplicationsPage() {
  const user = await requireFreelancer();
  const profile = await getFreelancerProfile(user.id);
  const applications = profile ? await getFreelancerApplications(profile.id) : [];

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Candidaturas" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Minhas candidaturas
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Acompanhe suas vagas. O WhatsApp do estabelecimento aparece apenas
              quando a candidatura for aceita.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/app/freelancer">
              <ArrowLeft className="size-4" />
              Acessar area do freelancer
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-background shadow-sm">
          {applications.length ? (
            <div className="divide-y">
              {applications.map((application) => (
                <article key={application.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                  <div className="flex gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-sm font-medium text-muted-foreground">
                      {application.establishmentPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={application.establishmentPhotoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        application.establishmentName.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h2 className="font-medium">{application.job.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.establishmentName} - {application.specialtyName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatJobSchedule(application.job)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Endereco: {formatJobAddress(application.job)}
                      </p>
                      {application.job.description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {application.job.description}
                        </p>
                      ) : null}
                      {application.job.requirements ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                          Requisitos: {application.job.requirements}
                        </p>
                      ) : null}
                      {application.establishmentWhatsapp ? (
                        <p className="mt-2 text-sm font-medium">
                          WhatsApp liberado: {application.establishmentWhatsapp}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-2 md:min-w-44">
                    <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                      Candidatura: {getApplicationStatusLabel(application.status)}
                    </div>
                    <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                      Vaga: {getJobStatusLabel(application.job.status)}
                    </div>
                    {getJobMapsUrl(application.job) ? (
                      <Button asChild variant="outline">
                        <a href={getJobMapsUrl(application.job) ?? ""} target="_blank" rel="noreferrer">
                          <MapPin className="size-4" />
                          Abrir no Maps
                        </a>
                      </Button>
                    ) : null}
                    {application.establishmentWhatsapp ? (
                      <Button asChild>
                        <a
                          href={
                            getWhatsAppUrl(
                              application.establishmentWhatsapp,
                              getFreelancerToEstablishmentMessage({
                                freelancerName: user.name,
                                jobTitle: application.job.title,
                              }),
                            ) ?? ""
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="size-4" />
                          Chamar no WhatsApp
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <ClipboardList className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-medium">Nenhuma candidatura ainda</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Busque vagas abertas e candidate-se para acompanhar por aqui.
              </p>
              <Button asChild className="mt-4">
                <Link href="/vagas">Buscar vagas</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
