import { AccessRequiredCard } from "@/components/access/access-required-card";
import { JobPostForm } from "@/components/forms/job-post-form";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveSpecialties } from "@/lib/profiles/profile-store";
import {
  getPlanPathForRole,
  hasActiveAccess,
  requireEstablishment,
} from "@/server/guards/auth";

export default async function NewJobPostPage() {
  const user = await requireEstablishment();
  const activeAccess = await hasActiveAccess(user);

  if (!activeAccess) {
    return (
      <main className="min-h-screen bg-muted/30 text-foreground">
        <AppHeader title="Nova vaga" userName={user.name} />
        <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
          <AccessRequiredCard
            planPath={getPlanPathForRole(user.role)}
            returnPath="/app/estabelecimento"
            description="Seu periodo de teste terminou. Ative um plano para voltar a criar vagas e receber candidaturas."
          />
        </section>
      </main>
    );
  }

  const specialties = await getActiveSpecialties();

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Nova vaga" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Criar vaga</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Informe data, horario, especialidade, pagamento e local da diaria.
          </p>
        </div>
        <JobPostForm specialties={specialties} />
      </section>
    </main>
  );
}
