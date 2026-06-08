import { Building2, ClipboardList, UsersRound } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentDashboardPage() {
  const user = await requireEstablishment();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Area do estabelecimento" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Painel do estabelecimento
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta esta logada e protegida. As proximas etapas liberam CRUD
            de vagas e gestao de candidatos.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Perfil", "Revise os dados do estabelecimento.", Building2, "/app/estabelecimento/perfil"],
            ["Vagas", "Publique e gerencie oportunidades.", ClipboardList, "/app/estabelecimento/vagas"],
            ["Catalogo", "Veja a area logada de estabelecimentos.", UsersRound, "/estabelecimentos"],
          ].map(([title, description, Icon, href]) => (
            <article key={title as string} className="rounded-md border bg-background p-4">
              <Icon className="mb-4 size-5 text-muted-foreground" />
              <h2 className="font-medium">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description as string}
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={href as string}>Abrir</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
