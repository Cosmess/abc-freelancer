import { Building2, ClipboardList, CreditCard, Users } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentDashboardPage() {
  const user = await requireEstablishment();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Area do estabelecimento" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Painel do estabelecimento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua conta esta logada e protegida. As proximas etapas liberam CRUD
            de vagas e gestao de candidatos.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            ["Perfil", "Revise os dados do estabelecimento.", Building2, "/app/estabelecimento/perfil"],
            ["Vagas", "Publique e gerencie oportunidades.", ClipboardList, "/app/estabelecimento/vagas"],
            ["Freelancers", "Busque profissionais disponiveis.", Users, "/freelancers"],
            ["Plano", "Gerencie sua assinatura e pagamentos.", CreditCard, "/app/estabelecimento/plano"],
          ].map(([title, description, Icon, href]) => (
            <article key={title as string} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="size-5 text-primary" />
              </div>
              <h2 className="font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description as string}
              </p>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href={href as string}>Abrir</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
