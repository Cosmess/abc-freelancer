import Link from "next/link";
import { ArrowLeft, ClipboardList, LockKeyhole, Plus, Trash2, Users } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getJobStatusLabel } from "@/lib/jobs/formatters";
import { getJobPostsByEstablishment } from "@/lib/jobs/job-store";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { closeJobPostAction, deleteJobPostAction } from "@/server/actions/jobs";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentJobsPage() {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);
  const jobs = profile ? await getJobPostsByEstablishment(profile.id) : [];

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Vagas" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-5 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Minhas vagas
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Crie vagas, acompanhe candidatos e exclua oportunidades encerradas.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/app/estabelecimento">
                <ArrowLeft className="size-4" />
                Voltar ao painel
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/app/estabelecimento/vagas/nova">
                <Plus className="size-4" />
                Nova vaga
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          {jobs.length ? (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <article key={job.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm font-semibold text-muted-foreground sm:size-14">
                      {profile?.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.profilePhotoUrl} alt="" className="size-full object-cover" />
                      ) : (
                        profile?.tradeName.slice(0, 1).toUpperCase() ?? "E"
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold">{job.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.city}
                        {job.neighborhood ? `, ${job.neighborhood}` : ""} —{" "}
                        {new Date(job.workDate).toLocaleDateString("pt-BR")} das{" "}
                        {job.startTime} as {job.endTime}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        R$ {(job.paymentValue / 100).toFixed(2).replace(".", ",")} —{" "}
                        {job.quantity} vaga(s) —{" "}
                        <span className="font-medium text-foreground">{getJobStatusLabel(job.status)}</span>
                      </p>
                      {job.acceptedApplicationCount > 0 ? (
                        <p className="mt-1 text-xs text-primary/80">
                          {job.acceptedApplicationCount} aceite(s) — nao pode ser excluida.
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/app/estabelecimento/vagas/${job.id}/candidatos`}>
                        <Users className="size-4" />
                        Candidatos
                      </Link>
                    </Button>
                    {job.status !== "FINISHED" ? (
                      <form action={closeJobPostAction.bind(null, job.id)}>
                        <Button variant="outline" size="sm" type="submit">
                          <LockKeyhole className="size-4" />
                          Encerrar
                        </Button>
                      </form>
                    ) : null}
                    {job.acceptedApplicationCount === 0 ? (
                      <form action={deleteJobPostAction.bind(null, job.id)}>
                        <Button variant="destructive" size="sm" type="submit">
                          <Trash2 className="size-4" />
                          Excluir
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
              <h2 className="font-semibold">Nenhuma vaga criada</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete o perfil do estabelecimento e crie a primeira vaga.
              </p>
              <Button asChild className="mt-4">
                <Link href="/app/estabelecimento/vagas/nova">
                  <Plus className="size-4" />
                  Criar primeira vaga
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
