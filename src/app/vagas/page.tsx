import Link from "next/link";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, MapPin, Search, Send } from "lucide-react";

import { AccessRequiredCard } from "@/components/access/access-required-card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/client";
import {
  formatJobAddress,
  formatJobSchedule,
  getApplicationStatusLabel,
  getJobMapsUrl,
} from "@/lib/jobs/formatters";
import { JOBS_PAGE_SIZE, getOpenJobListingsPaged } from "@/lib/jobs/job-store";
import { getActiveSpecialties, getFreelancerProfile } from "@/lib/profiles/profile-store";
import { applyToJobAction } from "@/server/actions/jobs";
import {
  getPlanPathForRole,
  hasActiveAccess,
  requireUser,
} from "@/server/guards/auth";

type Props = {
  searchParams: Promise<{
    cidade?: string;
    bairro?: string;
    especialidade?: string;
    pagina?: string;
  }>;
};

export default async function JobsPage({ searchParams }: Props) {
  const user = await requireUser();
  const activeAccess = await hasActiveAccess(user);

  if (!activeAccess) {
    const returnPath =
      user.role === UserRole.ESTABLISHMENT
        ? "/app/estabelecimento"
        : "/app/freelancer";

    return (
      <main className="min-h-screen bg-muted/30 text-foreground">
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-5">
          <div>
            <Link href="/" className="text-sm font-medium text-primary">
              ABC Freelancer
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Vagas abertas
            </h1>
          </div>
          <AccessRequiredCard
            planPath={getPlanPathForRole(user.role)}
            returnPath={returnPath}
            description="Seu periodo de teste terminou. Ative um plano para voltar a acessar vagas, candidaturas e contatos liberados pela plataforma."
          />
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);
  const freelancerProfile =
    user.role === UserRole.FREELANCER ? await getFreelancerProfile(user.id) : null;
  const [catalog, specialties] = await Promise.all([
    getOpenJobListingsPaged({
      freelancerId: freelancerProfile?.id,
      filters: {
        city: params.cidade,
        neighborhood: params.bairro,
        specialtyId: params.especialidade,
      },
      page,
    }),
    getActiveSpecialties(),
  ]);

  const hasFilters = Boolean(params.cidade || params.bairro || params.especialidade);

  function buildPageUrl(targetPage: number) {
    const p = new URLSearchParams();
    if (params.cidade) p.set("cidade", params.cidade);
    if (params.bairro) p.set("bairro", params.bairro);
    if (params.especialidade) p.set("especialidade", params.especialidade);
    if (targetPage > 1) p.set("pagina", String(targetPage));
    const qs = p.toString();
    return `/vagas${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-sm font-medium text-primary">
              ABC Freelancer
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Vagas abertas
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Busque oportunidades por localidade e especialidade. O contato so
              aparece apos aceite da candidatura.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={user.role === UserRole.FREELANCER ? "/app/freelancer" : "/app/estabelecimento"}>
              <Search className="size-4" />
              Voltar ao painel
            </Link>
          </Button>
        </div>

        <form
          className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto]"
          action="/vagas"
        >
          <label className="grid gap-1.5 text-sm font-medium">
            Cidade
            <input
              className="h-10 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              name="cidade"
              defaultValue={params.cidade ?? ""}
              placeholder="Ex: Santo Andre"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Bairro
            <input
              className="h-10 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              name="bairro"
              defaultValue={params.bairro ?? ""}
              placeholder="Ex: Centro"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Especialidade
            <select
              className="h-10 rounded-md border bg-input px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
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
          <Button className="h-10 w-full self-end md:w-auto" type="submit">
            <Search className="size-4" />
            Buscar
          </Button>
        </form>

        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {catalog.total === 0
              ? "Nenhuma vaga aberta"
              : `${catalog.total} vaga${catalog.total !== 1 ? "s" : ""} aberta${catalog.total !== 1 ? "s" : ""}`}
            {hasFilters ? " com os filtros aplicados" : ""}
          </span>
          {catalog.totalPages > 1 && (
            <span>
              Pagina {catalog.page} de {catalog.totalPages}
            </span>
          )}
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          {catalog.items.length ? (
            <div className="divide-y divide-border">
              {catalog.items.map((job) => (
                <article key={job.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm font-semibold text-muted-foreground sm:size-14">
                      {job.establishmentPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={job.establishmentPhotoUrl} alt="" className="size-full object-cover" />
                      ) : (
                        job.establishmentName.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold">{job.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.establishmentName} — {job.specialtyName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatJobSchedule(job)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatJobAddress(job)}
                      </p>
                      {job.description ? (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {job.description}
                        </p>
                      ) : null}
                      {job.requirements ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Requisitos:</span>{" "}
                          {job.requirements}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-2 lg:min-w-48">
                    <div className="rounded-md bg-muted/60 px-3 py-2 text-sm font-medium text-foreground">
                      R$ {(job.paymentValue / 100).toFixed(2).replace(".", ",")} —{" "}
                      {job.quantity} vaga(s)
                    </div>
                    {user.role === UserRole.FREELANCER ? (
                      job.applicationStatus ? (
                        <div className="rounded-md border px-3 py-2 text-center text-xs text-muted-foreground">
                          Candidatura: {getApplicationStatusLabel(job.applicationStatus)}
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
                    {getJobMapsUrl(job) ? (
                      <Button asChild variant="outline">
                        <a href={getJobMapsUrl(job) ?? ""} target="_blank" rel="noreferrer">
                          <MapPin className="size-4" />
                          Abrir no Maps
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <BriefcaseBusiness className="mb-4 size-6 text-muted-foreground" />
              <h2 className="font-semibold">Nenhuma vaga aberta</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {hasFilters
                  ? "Tente ajustar os filtros para ver mais resultados."
                  : "Nenhuma vaga aberta no momento. Verifique mais tarde."}
              </p>
              {hasFilters && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/vagas">Limpar filtros</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {catalog.totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              {Math.min((catalog.page - 1) * JOBS_PAGE_SIZE + 1, catalog.total)}–
              {Math.min(catalog.page * JOBS_PAGE_SIZE, catalog.total)} de {catalog.total}
            </p>
            <div className="flex items-center gap-2">
              {catalog.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageUrl(catalog.page - 1)}>
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
              )}

              <span className="px-2 text-sm font-medium">
                {catalog.page} / {catalog.totalPages}
              </span>

              {catalog.page < catalog.totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageUrl(catalog.page + 1)}>
                    Proxima
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Proxima
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
