import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/server/guards/auth";
import { logoutAction } from "@/server/actions/auth";

const steps = [
  "Crie sua conta como freelancer ou estabelecimento.",
  "Complete o perfil e aguarde validacao quando necessario.",
  "Use a area logada para buscar vagas, catalogos e candidaturas.",
];

const features = [
  {
    title: "Trial de 7 dias",
    description: "Comece sem pagamento enquanto valida o fluxo.",
    Icon: Clock,
  },
  {
    title: "Acesso protegido",
    description: "Catalogo, busca e areas operacionais ficam logados.",
    Icon: ShieldCheck,
  },
  {
    title: "Contato controlado",
    description: "Telefone e WhatsApp so entram no fluxo apos aceite.",
    Icon: CheckCircle2,
  },
];

function getProfilePath(role: UserRole) {
  if (role === UserRole.ESTABLISHMENT) return "/app/estabelecimento/perfil";
  if (role === UserRole.ADMIN) return "/admin";
  return "/app/freelancer/perfil";
}

function getDashboardPath(role: UserRole) {
  if (role === UserRole.ESTABLISHMENT) return "/app/estabelecimento";
  if (role === UserRole.ADMIN) return "/admin";
  return "/app/freelancer";
}

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-5">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-primary">ABC</span>
            <span className="text-foreground">Freelancer</span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={getDashboardPath(user.role)}>Painel</Link>
                </Button>
                <form action={logoutAction}>
                  <Button type="submit" variant="outline" size="sm">
                    Sair
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/cadastro">
                    Criar conta
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative border-b border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-5 sm:py-16 lg:min-h-[72vh] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted px-3 py-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              ABCD Paulista
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Contrate profissionais locais ou{" "}
                <span className="text-primary">encontre trabalhos</span> por data.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                O ABC Freelancer conecta bares, restaurantes, clinicas, eventos e
                negocios locais com profissionais disponiveis para diarias, turnos
                e demandas pontuais.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {user ? (
                <>
                  <Button size="lg" className="h-11 w-full sm:w-auto" asChild>
                    <Link href={getDashboardPath(user.role)}>
                      <BriefcaseBusiness className="size-4" />
                      Acessar painel
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 w-full sm:w-auto" asChild>
                    <Link href={getProfilePath(user.role)}>
                      <UserRound className="size-4" />
                      Meu perfil
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="h-11 w-full sm:w-auto" asChild>
                    <Link href="/cadastro/freelancer">
                      <UserRound className="size-4" />
                      Sou freelancer
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 w-full sm:w-auto" asChild>
                    <Link href="/cadastro/estabelecimento">
                      <Building2 className="size-4" />
                      Tenho estabelecimento
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <article
                key={step}
                className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-muted-foreground">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-5 md:grid-cols-3">
        {features.map(({ title, description, Icon }) => (
          <article
            key={title}
            className="rounded-lg border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15">
              <Icon className="size-5 text-primary" />
            </div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-border/60 bg-card/40 px-4 py-10 sm:px-5">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Busca e catalogo ficam dentro da area logada.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre para acessar vagas, estabelecimentos e proximas ferramentas operacionais.
            </p>
          </div>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href={user ? getDashboardPath(user.role) : "/login"}>
              <BriefcaseBusiness className="size-4" />
              Acessar area logada
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 px-4 py-6 sm:px-5">
        <div className="mx-auto max-w-6xl text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ABC Freelancer — ABCD Paulista
        </div>
      </footer>
    </main>
  );
}
