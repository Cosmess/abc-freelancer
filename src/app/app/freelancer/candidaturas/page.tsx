import { ClipboardList } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { requireFreelancer } from "@/server/guards/auth";

export default async function FreelancerApplicationsPage() {
  const user = await requireFreelancer();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Candidaturas" userName={user.name} />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-md border bg-background p-5">
          <ClipboardList className="mb-4 size-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-normal">
            Minhas candidaturas
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Esta area fica reservada para acompanhar candidaturas quando o fluxo
            de vagas estiver implementado.
          </p>
        </div>
      </section>
    </main>
  );
}
