import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, LockKeyhole, Plus, Trash2, Users } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getJobStatusLabel } from "@/lib/jobs/formatters";
import { JOBS_PAGE_SIZE, getJobPostsByEstablishmentPaged } from "@/lib/jobs/job-store";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { closeJobPostAction, deleteJobPostAction } from "@/server/actions/jobs";
import { requireEstablishment } from "@/server/guards/auth";

type Props = {
  searchParams: Promise<{
    pagina?: string;
    filtro?: string;
  }>;
};

export default async function EstablishmentJobsPage({ searchParams }: Props) {
  const user = await requireEstablishment();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);
  const profile = await getEstablishmentProfile(user.id);

  const catalog = profile ? await getJobPostsByEstablishmentPaged(profile.id, page) : { items: [], total: 0, page, pageSize: JOBS_PAGE_SIZE, totalPages: 0 };

  // Apply filter
  let filteredItems = catalog.items;
  const filter = params.filtro;
  if (filter === "com-candidatos") {
    filteredItems = catalog.items.filter((job) => job.totalApplicationCount > 0);
  } else if (filter === "sem-candidatos") {
    filteredItems = catalog.items.filter((job) => job.totalApplicationCount === 0);
  }

  function buildPageUrl(targetPage: number) {
    const p = new URLSearchParams();
    if (filter) p.set("filtro", filter);
    if (targetPage > 1) p.set("pagina", String(targetPage));
    const qs = p.toString();
    return `/app/estabelecimento/vagas${qs ? `?${qs}` : ""}`;
  }

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

        {/* Filter */}
        {catalog.items.length > 0 && (
          <form action="/app/estabelecimento/vagas" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid gap-1.5 text-sm font-medium">
              Filtrar vagas
              <select
                className="h-10 rounded-md border bg-input px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                name="filtro"
                defaultValue={filter ?? ""}
                onChange={(e) => e.currentTarget.form?.submit()}
              >
                <option value="">Todas as vagas</option>
                <option value="com-candidatos">Com candidatos</option>
                <option value="sem-candidatos">Sem candidatos</option>
              </select>
            </label>
            {filter && (
              <Button asChild variant="outline" size="sm">
                <Link href="/app/estabelecimento/vagas">Limpar filtro</Link>
              </Button>
            )}
          </form>
        )}

        <div className="rounded-lg border bg-card shadow-sm">
          {filteredItems.length ? (
            <div className="divide-y divide-border">
              {filteredItems.map((job) => (
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{job.totalApplicationCount}</span> candidato(s) {job.acceptedApplicationCount > 0 && `(${job.acceptedApplicationCount} aceito(s))`}
                      </p>
                      {job.acceptedApplicationCount > 0 ? (
                        <p className="mt-1 text-xs text-primary/80">
                          Nao pode ser excluida — tem candidato(s) aceito(s).
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
              <h2 className="font-semibold">
                {filter ? "Nenhuma vaga encontrada com este filtro" : "Nenhuma vaga criada"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {filter
                  ? "Ajuste o filtro para ver mais vagas."
                  : "Complete o perfil do estabelecimento e crie a primeira vaga."}
              </p>
              {!filter && (
                <Button asChild className="mt-4">
                  <Link href="/app/estabelecimento/vagas/nova">
                    <Plus className="size-4" />
                    Criar primeira vaga
                  </Link>
                </Button>
              )}
              {filter && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/app/estabelecimento/vagas">Limpar filtro</Link>
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
