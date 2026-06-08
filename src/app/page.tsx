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

const steps = [
  "Crie sua conta como freelancer ou estabelecimento.",
  "Complete o perfil e aguarde validacao quando necessario.",
  "Use a area logada para buscar vagas, catalogos e candidaturas.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-semibold">
            ABC Freelancer
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">
                Criar conta
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid min-h-[70vh] max-w-6xl content-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              ABCD Paulista
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                Contrate diaristas locais ou encontre trabalhos por data.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                O ABC Freelancer conecta bares, restaurantes, clinicas, eventos
                e negocios locais com profissionais disponiveis para diarias,
                turnos e demandas pontuais.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-11" asChild>
                <Link href="/cadastro/freelancer">
                  <UserRound className="size-4" />
                  Sou freelancer
                </Link>
              </Button>
              <Button className="h-11" variant="outline" asChild>
                <Link href="/cadastro/estabelecimento">
                  <Building2 className="size-4" />
                  Tenho estabelecimento
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <article key={step} className="rounded-md border bg-background p-4 shadow-sm">
                <div className="mb-3 flex size-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10 md:grid-cols-3">
        {[
          ["Trial de 7 dias", "Comece sem pagamento enquanto valida o fluxo.", Clock],
          ["Acesso protegido", "Catalogo, busca e areas operacionais ficam logados.", ShieldCheck],
          ["Contato controlado", "Telefone e WhatsApp so entram no fluxo apos aceite.", CheckCircle2],
        ].map(([title, description, Icon]) => (
          <article key={title as string} className="rounded-md border bg-background p-4">
            <Icon className="mb-4 size-5 text-muted-foreground" />
            <h2 className="font-medium">{title as string}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description as string}
            </p>
          </article>
        ))}
      </section>

      <section className="border-t bg-muted/30 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">
              Busca e catalogo ficam dentro da area logada.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre para acessar vagas, estabelecimentos e proximas ferramentas
              operacionais.
            </p>
          </div>
          <Button asChild>
            <Link href="/login">
              <BriefcaseBusiness className="size-4" />
              Acessar area logada
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
