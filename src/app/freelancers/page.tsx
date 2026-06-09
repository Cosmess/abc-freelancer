import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, MessageCircle, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { getInstagramUrl, getWhatsAppUrl } from "@/lib/jobs/formatters";
import {
  CATALOG_PAGE_SIZE,
  getActiveSpecialties,
  getEstablishmentProfile,
  getFreelancerCatalog,
} from "@/lib/profiles/profile-store";
import { requireEstablishment } from "@/server/guards/auth";

export const metadata: Metadata = {
  title: "Freelancers — ABC Freelancer",
  description: "Encontre profissionais disponiveis para diarias no ABCD Paulista.",
};

type Props = {
  searchParams: Promise<{
    cidade?: string;
    especialidade?: string;
    turno?: string;
    pagina?: string;
  }>;
};

const SHIFT_OPTIONS = [
  { value: "madrugada", label: "Madrugada (00:00–06:00)" },
  { value: "manha", label: "Manha (06:00–12:00)" },
  { value: "tarde", label: "Tarde (12:00–18:00)" },
  { value: "noite", label: "Noite (18:00–23:59)" },
];

export default async function FreelancerCatalogPage({ searchParams }: Props) {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);

  const [catalog, specialties] = await Promise.all([
    getFreelancerCatalog({
      city: params.cidade,
      specialtyId: params.especialidade,
      shift: params.turno,
      page,
    }),
    getActiveSpecialties(),
  ]);

  const hasFilters = Boolean(params.cidade || params.especialidade || params.turno);

  function buildPageUrl(targetPage: number) {
    const p = new URLSearchParams();
    if (params.cidade) p.set("cidade", params.cidade);
    if (params.especialidade) p.set("especialidade", params.especialidade);
    if (params.turno) p.set("turno", params.turno);
    if (targetPage > 1) p.set("pagina", String(targetPage));
    const qs = p.toString();
    return `/freelancers${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-5">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-sm font-medium text-primary">
              ABC Freelancer
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Freelancers
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Profissionais aprovados no ABCD Paulista. Filtre por cidade,
              especialidade ou horario disponivel.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/estabelecimento">
              Voltar ao painel
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <form
          className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto]"
          action="/freelancers"
        >
          <label className="grid gap-1.5 text-sm font-medium">
            Cidade
            <input
              className="h-10 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm"
              name="cidade"
              defaultValue={params.cidade ?? ""}
              placeholder="Ex: Santo Andre"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Especialidade
            <select
              className="h-10 rounded-md border bg-input px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring sm:text-sm"
              name="especialidade"
              defaultValue={params.especialidade ?? ""}
            >
              <option value="">Todas</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Turno disponivel
            <select
              className="h-10 rounded-md border bg-input px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring sm:text-sm"
              name="turno"
              defaultValue={params.turno ?? ""}
            >
              <option value="">Qualquer turno</option>
              {SHIFT_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
              ? "Nenhum freelancer encontrado"
              : `${catalog.total} freelancer${catalog.total !== 1 ? "s" : ""} encontrado${catalog.total !== 1 ? "s" : ""}`}
            {hasFilters ? " com os filtros aplicados" : ""}
          </span>
          {catalog.totalPages > 1 && (
            <span>
              Pagina {catalog.page} de {catalog.totalPages}
            </span>
          )}
        </div>

        {/* Grid */}
        {catalog.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalog.items.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} senderName={profile?.tradeName} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <Users className="mx-auto mb-4 size-8 text-muted-foreground" />
            <h2 className="font-semibold">Nenhum freelancer encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFilters
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Nenhum freelancer aprovado ainda. Verifique mais tarde."}
            </p>
            {hasFilters && (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/freelancers">Limpar filtros</Link>
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {catalog.totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              {Math.min((catalog.page - 1) * CATALOG_PAGE_SIZE + 1, catalog.total)}–
              {Math.min(catalog.page * CATALOG_PAGE_SIZE, catalog.total)} de {catalog.total}
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

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

type CardProps = {
  freelancer: {
    id: string;
    fullName: string;
    city: string | null;
    neighborhood: string | null;
    bio: string | null;
    profilePhotoUrl: string | null;
    instagram: string | null;
    whatsapp: string | null;
    specialties: Array<{ id: string; name: string }>;
    shifts: string[];
  };
  senderName?: string | null;
};

function FreelancerCard({ freelancer, senderName }: CardProps) {
  const MAX_SPECIALTIES = 3;
  const MAX_SHIFTS = 4;
  const visibleSpecialties = freelancer.specialties.slice(0, MAX_SPECIALTIES);
  const extraSpecialties = freelancer.specialties.length - MAX_SPECIALTIES;
  const visibleShifts = freelancer.shifts.slice(0, MAX_SHIFTS);
  const extraShifts = freelancer.shifts.length - MAX_SHIFTS;
  const instagramUrl = getInstagramUrl(freelancer.instagram);
  const whatsappMessage = `ola sou do ${senderName || "ABC Freelancer"} encontrei o seu contato no site abcfreelancer`;

  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-border/80 hover:bg-card/80">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-lg font-bold text-muted-foreground">
          {freelancer.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={freelancer.profilePhotoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            freelancer.fullName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-semibold leading-tight">{freelancer.fullName}</h2>
          {(freelancer.city || freelancer.neighborhood) && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {[freelancer.city, freelancer.neighborhood].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {freelancer.bio && (
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
          {freelancer.bio}
        </p>
      )}

      {/* Specialties */}
      {freelancer.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSpecialties.map((s) => (
            <span
              key={s.id}
              className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {s.name}
            </span>
          ))}
          {extraSpecialties > 0 && (
            <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
              +{extraSpecialties}
            </span>
          )}
        </div>
      )}

      {/* Availability */}
      {freelancer.shifts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleShifts.map((shift) => (
            <span
              key={shift}
              className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {shift}
            </span>
          ))}
          {extraShifts > 0 && (
            <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
              +{extraShifts}
            </span>
          )}
        </div>
      )}

      {/* Social links */}
      <div className="mt-auto flex flex-wrap gap-3">
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <InstagramIcon className="size-3.5" />
            {freelancer.instagram?.replace(/^@/, "@") ?? ""}
          </a>
        )}
        {freelancer.whatsapp && (
          <a
            href={getWhatsAppUrl(freelancer.whatsapp, whatsappMessage) || ""}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
