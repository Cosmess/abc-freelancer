import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getJobPostsByEstablishment } from "@/lib/jobs/job-store";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentJobsPage() {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);
  const jobs = profile ? await getJobPostsByEstablishment(profile.id) : [];

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Vagas do estabelecimento" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Minhas vagas
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Crie vagas para freelancers e acompanhe o status das oportunidades.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/estabelecimento/vagas/nova">
              <Plus className="size-4" />
              Nova vaga
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-background shadow-sm">
          {jobs.length ? (
            <div className="divide-y">
              {jobs.map((job) => (
                <article key={job.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <h2 className="font-medium">{job.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.city}
                      {job.neighborhood ? `, ${job.neighborhood}` : ""} -{" "}
                      {new Date(job.workDate).toLocaleDateString("pt-BR")} das{" "}
                      {job.startTime} as {job.endTime}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    R$ {(job.paymentValue / 100).toFixed(2).replace(".", ",")} ·{" "}
                    {job.quantity} vaga(s) · {job.status}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <ClipboardList className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-medium">Nenhuma vaga criada</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete o perfil do estabelecimento e crie a primeira vaga.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
