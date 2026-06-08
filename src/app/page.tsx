import Link from "next/link";
import { BriefcaseBusiness, Building2, MapPin, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const cities = [
  "Santo Andre",
  "Sao Bernardo do Campo",
  "Sao Caetano do Sul",
  "Diadema",
  "Maua",
  "Ribeirao Pires",
  "Rio Grande da Serra",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center gap-10 px-5 py-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              ABCD Paulista
            </div>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              ABC Freelancer
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Encontre vagas por dia, horario e especialidade ou publique uma
              diaria para contratar profissionais locais.
            </p>
          </div>

          <div className="grid gap-4 rounded-md border bg-background p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="grid gap-2 text-sm font-medium">
              Cidade
              <select className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">Todas as cidades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Bairro
              <input
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Centro"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Especialidade
              <input
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Garcom, cozinha, eventos"
              />
            </label>
            <Button className="h-11 self-end" asChild>
              <Link href="/vagas">
                <Search className="size-4" />
                Buscar
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link href="/estabelecimentos">
                <Building2 className="size-4" />
                Catalogo
              </Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link href="/cadastro/freelancer">
                <UserRound className="size-4" />
                Sou freelancer
              </Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link href="/cadastro/estabelecimento">
                <BriefcaseBusiness className="size-4" />
                Tenho estabelecimento
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
