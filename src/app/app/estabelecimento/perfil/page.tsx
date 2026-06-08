import { EstablishmentProfileForm } from "@/components/forms/establishment-profile-form";
import { AppHeader } from "@/components/layout/app-header";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentProfilePage() {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Perfil do estabelecimento" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Meu perfil</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Esses dados serao usados nas vagas e no catalogo publico quando o
            perfil estiver aprovado.
          </p>
        </div>
        <EstablishmentProfileForm user={user} profile={profile} />
      </section>
    </main>
  );
}
