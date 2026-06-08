import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EstablishmentProfileForm } from "@/components/forms/establishment-profile-form";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getEstablishmentProfile } from "@/lib/profiles/profile-store";
import { requireEstablishment } from "@/server/guards/auth";

export default async function EstablishmentProfilePage() {
  const user = await requireEstablishment();
  const profile = await getEstablishmentProfile(user.id);

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Perfil do estabelecimento" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-5 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Meu perfil</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Esses dados serao usados nas vagas e no catalogo publico quando o
              perfil estiver aprovado.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/estabelecimento">
              <ArrowLeft className="size-4" />
              Voltar ao painel
            </Link>
          </Button>
        </div>
        <EstablishmentProfileForm user={user} profile={profile} />
      </section>
    </main>
  );
}
