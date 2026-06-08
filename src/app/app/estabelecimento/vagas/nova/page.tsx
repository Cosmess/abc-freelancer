import { JobPostForm } from "@/components/forms/job-post-form";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveSpecialties } from "@/lib/profiles/profile-store";
import { requireEstablishment } from "@/server/guards/auth";

export default async function NewJobPostPage() {
  const user = await requireEstablishment();
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
