import { ClipboardList } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentJobsPage() {
  const user = await requireEstablishment();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Vagas do estabelecimento" userName={user.name} />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-md border bg-background p-5">
          <ClipboardList className="mb-4 size-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-normal">
            Minhas vagas
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Esta area fica reservada para criar e gerenciar vagas no proximo
            bloco de implementacao.
          </p>
        </div>
      </section>
    </main>
  );
}
