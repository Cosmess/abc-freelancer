import Link from "next/link";
import { Building2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EstablishmentsPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <section className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-sm font-medium text-muted-foreground">
              ABC Freelancer
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Estabelecimentos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              O catalogo publico mostrara apenas estabelecimentos aprovados,
              sem expor contatos antes das regras de aceite.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/estabelecimento">
              <Search className="size-4" />
              Acessar area do estabelecimento
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-background p-5 shadow-sm">
          <Building2 className="mb-4 size-6 text-muted-foreground" />
          <h2 className="font-medium">Catalogo em preparacao</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Os filtros por cidade, bairro, rua e nome entram junto com a
            aprovacao de perfis no admin.
          </p>
        </div>
      </section>
    </main>
  );
}
