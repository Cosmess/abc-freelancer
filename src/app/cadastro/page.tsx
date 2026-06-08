import Link from "next/link";
import { BriefcaseBusiness, Building2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SignupChoicePage() {
  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col justify-center gap-6">
        <Link href="/" className="text-sm font-medium text-muted-foreground">
          ABC Freelancer
        </Link>
        <section className="rounded-md border bg-background p-5 shadow-sm">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              Criar cadastro
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Escolha o tipo de conta para iniciar o trial de 7 dias.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-24 justify-start p-4" asChild>
              <Link href="/cadastro/freelancer">
                <UserRound className="size-5" />
                <span className="grid gap-1 text-left">
                  <span>Sou freelancer</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Quero encontrar vagas por diaria.
                  </span>
                </span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 justify-start p-4" asChild>
              <Link href="/cadastro/estabelecimento">
                <Building2 className="size-5" />
                <span className="grid gap-1 text-left">
                  <span>Tenho estabelecimento</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Quero publicar vagas e contratar.
                  </span>
                </span>
              </Link>
            </Button>
          </div>
        </section>
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/login">
            <BriefcaseBusiness className="size-4" />
            Ja tenho conta
          </Link>
        </Button>
      </div>
    </main>
  );
}
