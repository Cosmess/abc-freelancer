import Link from "next/link";
import { BriefcaseBusiness, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOpenJobPosts } from "@/lib/jobs/job-store";
import { requireUser } from "@/server/guards/auth";

export default async function JobsPage() {
  await requireUser();
  const jobs = await getOpenJobPosts();

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <section className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-sm font-medium text-muted-foreground">
              ABC Freelancer
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Vagas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              As vagas publicadas pelos estabelecimentos aparecerão aqui com
              filtros por cidade, bairro, data e especialidade.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/freelancer">
              <Search className="size-4" />
              Acessar area do freelancer
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
                    {job.quantity} vaga(s)
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <BriefcaseBusiness className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-medium">Nenhuma vaga aberta</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Assim que estabelecimentos criarem vagas, elas aparecem aqui.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
