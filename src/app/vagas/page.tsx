import Link from "next/link";
import { BriefcaseBusiness, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/server/guards/auth";

export default async function JobsPage() {
  await requireUser();

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

        <div className="rounded-md border bg-background p-5 shadow-sm">
          <BriefcaseBusiness className="mb-4 size-6 text-muted-foreground" />
          <h2 className="font-medium">Catalogo de vagas em preparacao</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Esta area ja esta bloqueada para usuarios logados. O proximo bloco
            implementa filtros reais, CRUD de vagas e candidatura.
          </p>
        </div>
      </section>
    </main>
  );
}
