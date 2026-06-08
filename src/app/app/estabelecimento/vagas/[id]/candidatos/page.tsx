import Link from "next/link";
import { ArrowLeft, Check, ClipboardList, X } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getApplicationStatusLabel } from "@/lib/jobs/formatters";
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
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="rounded-md border bg-background p-5">
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
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              {job.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Veja o perfil dos freelancers e aceite uma candidatura para
              liberar o WhatsApp entre as partes.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/app/estabelecimento/vagas">
              <ArrowLeft className="size-4" />
              Voltar para vagas
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-background shadow-sm">
          {applications.length ? (
            <div className="divide-y">
              {applications.map((application) => (
                <article key={application.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{application.freelancer.fullName}</h2>
                      <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {getApplicationStatusLabel(application.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.freelancer.city ?? "Cidade nao informada"}
                      {application.freelancer.neighborhood
                        ? `, ${application.freelancer.neighborhood}`
                        : ""}
                    </p>
                    {application.freelancer.specialties.length ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Especialidades: {application.freelancer.specialties.join(", ")}
                      </p>
                    ) : null}
                    {application.freelancer.bio ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {application.freelancer.bio}
                      </p>
                    ) : null}
                    {application.freelancer.experience ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Experiencia: {application.freelancer.experience}
                      </p>
                    ) : null}
                    {application.freelancer.whatsapp ? (
                      <p className="mt-2 text-sm font-medium">
                        WhatsApp liberado: {application.freelancer.whatsapp}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:min-w-48 lg:justify-end">
                    <form action={acceptApplicationAction.bind(null, application.id, job.id)}>
                      <Button type="submit">
                        <Check className="size-4" />
                        Aceitar
                      </Button>
                    </form>
                    <form action={rejectApplicationAction.bind(null, application.id, job.id)}>
                      <Button type="submit" variant="destructive">
                        <X className="size-4" />
                        Recusar
                      </Button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <ClipboardList className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-medium">Nenhum candidato ainda</h2>
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
