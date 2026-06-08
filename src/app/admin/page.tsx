import { ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { requireAdmin } from "@/server/guards/auth";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Admin" userName={user.name} />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-md border bg-background p-5">
          <ShieldCheck className="mb-4 size-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-normal">
            Administracao
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Area protegida para aprovar perfis, acompanhar usuarios, vagas e
            pagamentos.
          </p>
        </div>
      </section>
    </main>
  );
}
