import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

const specialties = [
  ["Garcom", "garcom", "Atendimento"],
  ["Cozinheiro", "cozinheiro", "Cozinha"],
  ["Auxiliar de cozinha", "auxiliar-de-cozinha", "Cozinha"],
  ["Chapeiro", "chapeiro", "Cozinha"],
  ["Barista", "barista", "Atendimento"],
  ["Bartender", "bartender", "Atendimento"],
  ["Recepcionista", "recepcionista", "Atendimento"],
  ["Atendente", "atendente", "Atendimento"],
  ["Caixa", "caixa", "Atendimento"],
  ["Seguranca", "seguranca", "Operacao"],
  ["Limpeza", "limpeza", "Operacao"],
  ["Promotor de evento", "promotor-de-evento", "Eventos"],
  ["Manicure", "manicure", "Beleza"],
  ["Cabeleireiro", "cabeleireiro", "Beleza"],
  ["Auxiliar administrativo", "auxiliar-administrativo", "Administrativo"],
  ["Dentista freelancer", "dentista-freelancer", "Saude"],
  ["Auxiliar odontologico", "auxiliar-odontologico", "Saude"],
] as const;

async function main() {
  await Promise.all(
    specialties.map(([name, slug, category]) =>
      prisma.specialty.upsert({
        where: { slug },
        update: { name, category, active: true },
        create: { name, slug, category, active: true },
      }),
    ),
  );

  await prisma.plan.upsert({
    where: {
      role_name: {
        role: UserRole.FREELANCER,
        name: "Freelancer Mensal",
      },
    },
    update: {
      priceCents: 1999,
      currency: "BRL",
      trialDays: 7,
      active: true,
    },
    create: {
      role: UserRole.FREELANCER,
      name: "Freelancer Mensal",
      description: "Plano mensal para freelancers com 7 dias gratis.",
      priceCents: 1999,
      currency: "BRL",
      trialDays: 7,
    },
  });

  await prisma.plan.upsert({
    where: {
      role_name: {
        role: UserRole.ESTABLISHMENT,
        name: "Estabelecimento Mensal",
      },
    },
    update: {
      priceCents: 9999,
      currency: "BRL",
      trialDays: 7,
      active: true,
    },
    create: {
      role: UserRole.ESTABLISHMENT,
      name: "Estabelecimento Mensal",
      description: "Plano mensal para estabelecimentos com 7 dias gratis.",
      priceCents: 9999,
      currency: "BRL",
      trialDays: 7,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
