import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
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
                  <div>
                    <h2 className="font-medium">{application.job.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.establishmentName} - {application.specialtyName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.job.city}
                      {application.job.neighborhood ? `, ${application.job.neighborhood}` : ""} -{" "}
                      {new Date(application.job.workDate).toLocaleDateString("pt-BR")} das{" "}
                      {application.job.startTime} as {application.job.endTime}
                    </p>
                    {application.establishmentWhatsapp ? (
                      <p className="mt-2 text-sm font-medium">
                        WhatsApp liberado: {application.establishmentWhatsapp}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                    {application.status}
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
