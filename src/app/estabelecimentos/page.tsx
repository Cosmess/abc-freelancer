import Link from "next/link";
import type { Metadata } from "next";
import { Building2, ChevronLeft, ChevronRight, MessageCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { getInstagramUrl, getWhatsAppUrl } from "@/lib/jobs/formatters";
import {
  CATALOG_PAGE_SIZE,
  getEstablishmentCatalog,
} from "@/lib/profiles/profile-store";
import { requireFreelancer } from "@/server/guards/auth";

export const metadata: Metadata = {
  title: "Estabelecimentos — ABC Freelancer",
  description: "Encontre bares, restaurantes e negocios no ABCD Paulista.",
};

type Props = {
  searchParams: Promise<{
    cidade?: string;
    bairro?: string;
    nome?: string;
    pagina?: string;
  }>;
};

export default async function EstablishmentCatalogPage({ searchParams }: Props) {
  await requireFreelancer();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);

  const catalog = await getEstablishmentCatalog({
    city: params.cidade,
    neighborhood: params.bairro,
    name: params.nome,
    page,
  });

  const hasFilters = Boolean(params.cidade || params.bairro || params.nome);

  function buildPageUrl(targetPage: number) {
    const p = new URLSearchParams();
    if (params.cidade) p.set("cidade", params.cidade);
    if (params.bairro) p.set("bairro", params.bairro);
    if (params.nome) p.set("nome", params.nome);
    if (targetPage > 1) p.set("pagina", String(targetPage));
    const qs = p.toString();
    return `/estabelecimentos${qs ? `?${qs}` : ""}`;
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
              Estabelecimentos
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Bares, restaurantes, clinicas e negocios do ABCD Paulista.
              Filtre por cidade, bairro ou nome.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/freelancer">Voltar ao painel</Link>
          </Button>
        </div>

        {/* Filters */}
        <form
          className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto]"
          action="/estabelecimentos"
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
            Bairro
            <input
              className="h-10 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm"
              name="bairro"
              defaultValue={params.bairro ?? ""}
              placeholder="Ex: Centro"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Nome
            <input
              className="h-10 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm"
              name="nome"
              defaultValue={params.nome ?? ""}
              placeholder="Ex: Bar do Ze"
            />
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
              ? "Nenhum estabelecimento encontrado"
              : `${catalog.total} estabelecimento${catalog.total !== 1 ? "s" : ""} encontrado${catalog.total !== 1 ? "s" : ""}`}
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
            {catalog.items.map((establishment) => (
              <EstablishmentCard key={establishment.id} establishment={establishment} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 size-8 text-muted-foreground" />
            <h2 className="font-semibold">Nenhum estabelecimento encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFilters
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Nenhum estabelecimento cadastrado ainda. Verifique mais tarde."}
            </p>
            {hasFilters && (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/estabelecimentos">Limpar filtros</Link>
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
  establishment: EstablishmentCatalogItem;
};

type EstablishmentCatalogItem = {
  id: string;
  tradeName: string;
  type: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  number: string | null;
  cep: string | null;
  description: string | null;
  profilePhotoUrl: string | null;
  instagram: string | null;
  whatsapp: string | null;
};

function formatAddress(item: EstablishmentCatalogItem): string | null {
  const parts = [
    [item.street, item.number].filter(Boolean).join(", "),
    item.neighborhood,
    item.city,
    item.cep ? `CEP ${item.cep}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" — ") : null;
}

function EstablishmentCard({ establishment }: CardProps) {
  const instagramUrl = getInstagramUrl(establishment.instagram);
  const address = formatAddress(establishment);

  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-border/80 hover:bg-card/80">
      {/* Logo + name */}
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-lg font-bold text-muted-foreground">
          {establishment.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={establishment.profilePhotoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            establishment.tradeName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-semibold leading-tight">
            {establishment.tradeName}
          </h2>
          {(establishment.city || establishment.neighborhood) && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {[establishment.city, establishment.neighborhood].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Type badge */}
      {establishment.type && (
        <span className="w-fit rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
          {establishment.type}
        </span>
      )}

      {/* Description */}
      {establishment.description && (
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
          {establishment.description}
        </p>
      )}

      {/* Address */}
      {address && (
        <p className="text-xs leading-5 text-muted-foreground">
          📍 {address}
        </p>
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
            {establishment.instagram?.replace(/^@/, "@") ?? ""}
          </a>
        )}
        {establishment.whatsapp && (
          <a
            href={getWhatsAppUrl(establishment.whatsapp, `ola sou do ${establishment.tradeName} encontrei o seu contato no site abcfreelancer`) || ""}
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
