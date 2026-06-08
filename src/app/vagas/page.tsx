import Link from "next/link";
import { BriefcaseBusiness, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/client";
import { getOpenJobListings } from "@/lib/jobs/job-store";
import { getActiveSpecialties, getFreelancerProfile } from "@/lib/profiles/profile-store";
import { applyToJobAction } from "@/server/actions/jobs";
import { requireUser } from "@/server/guards/auth";

type Props = {
  searchParams: Promise<{
    cidade?: string;
    bairro?: string;
    especialidade?: string;
  }>;
};

export default async function JobsPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;
  const freelancerProfile =
    user.role === UserRole.FREELANCER ? await getFreelancerProfile(user.id) : null;
  const [jobs, specialties] = await Promise.all([
    getOpenJobListings({
      freelancerId: freelancerProfile?.id,
      filters: {
        city: params.cidade,
        neighborhood: params.bairro,
        specialtyId: params.especialidade,
      },
    }),
    getActiveSpecialties(),
  ]);

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
              Busque oportunidades abertas por localidade e especialidade. O
              contato do estabelecimento so aparece depois que a candidatura for
              aceita.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={user.role === UserRole.FREELANCER ? "/app/freelancer" : "/app/estabelecimento"}>
              <Search className="size-4" />
              Voltar ao painel
            </Link>
          </Button>
        </div>

        <form className="grid gap-3 rounded-md border bg-background p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]" action="/vagas">
          <label className="grid gap-2 text-sm font-medium">
            Cidade
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              name="cidade"
              defaultValue={params.cidade ?? ""}
              placeholder="Ex: Sao Paulo"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Bairro
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              name="bairro"
              defaultValue={params.bairro ?? ""}
              placeholder="Ex: Centro"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Especialidade
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              name="especialidade"
              defaultValue={params.especialidade ?? ""}
            >
              <option value="">Todas</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </label>
          <Button className="self-end" type="submit">
            <Search className="size-4" />
            Buscar
          </Button>
        </form>

        <div className="rounded-md border bg-background shadow-sm">
          {jobs.length ? (
            <div className="divide-y">
              {jobs.map((job) => (
                <article key={job.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <h2 className="font-medium">{job.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.establishmentName} - {job.specialtyName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.city}
                      {job.neighborhood ? `, ${job.neighborhood}` : ""} -{" "}
                      {new Date(job.workDate).toLocaleDateString("pt-BR")} das{" "}
                      {job.startTime} as {job.endTime}
                    </p>
                    {job.description ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {job.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground lg:min-w-48">
                    <div>
                      R$ {(job.paymentValue / 100).toFixed(2).replace(".", ",")} -{" "}
                      {job.quantity} vaga(s)
                    </div>
                    {user.role === UserRole.FREELANCER ? (
                      job.applicationStatus ? (
                        <div className="rounded-md border px-3 py-2 text-xs">
                          Candidatura: {job.applicationStatus}
                        </div>
                      ) : (
                        <form action={applyToJobAction.bind(null, job.id)}>
                          <Button className="w-full" type="submit">
                            <Send className="size-4" />
                            Candidatar
                          </Button>
                        </form>
                      )
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <BriefcaseBusiness className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-medium">Nenhuma vaga aberta</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ajuste os filtros ou aguarde novas vagas dos estabelecimentos.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
