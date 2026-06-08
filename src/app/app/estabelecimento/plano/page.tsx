import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { PlanPageContent } from "@/components/forms/plan-page-content";
import { UserRole } from "@/generated/prisma/client";
import {
  getPlanForRole,
  getLatestSubscriptionForUser,
  getRecentPaymentsForUser,
} from "@/lib/mercadopago/subscription";
import { requireEstablishment } from "@/server/guards/auth";

export const metadata: Metadata = { title: "Meu Plano — ABC Freelancer" };

type Props = {
  searchParams: Promise<{ sucesso?: string; aviso?: string; erro?: string }>;
};

export default async function EstablishmentPlanPage({ searchParams }: Props) {
  const user = await requireEstablishment();
  const params = await searchParams;

  const [plan, subscription, payments] = await Promise.all([
    getPlanForRole(UserRole.ESTABLISHMENT),
    getLatestSubscriptionForUser(user.id),
    getRecentPaymentsForUser(user.id),
  ]);

  const now = new Date();
  const trialEndsAt = new Date(user.trialEndsAt);
  const trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000));
  const trialStatus = now <= trialEndsAt ? "active" : "expired";

  const subStatus = subscription?.status as
    | "ACTIVE"
    | "AUTHORIZED"
    | "PENDING"
    | "CANCELLED"
    | "PAUSED"
    | "EXPIRED"
    | "PAST_DUE"
    | null ?? null;

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Meu plano" userName={user.name} />
      <section className="mx-auto grid max-w-2xl gap-5 px-4 py-6 sm:px-5 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Meu plano</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie sua assinatura e acompanhe o historico de pagamentos.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/estabelecimento">
              <ArrowLeft className="size-4" />
              Voltar ao painel
            </Link>
          </Button>
        </div>

        {plan ? (
          <PlanPageContent
            planName={plan.name}
            planDescription={plan.description}
            priceCents={plan.priceCents}
            trialDaysLeft={trialDaysLeft}
            trialStatus={trialStatus}
            subscriptionStatus={subStatus}
            recentPayments={payments}
            success={params.sucesso ?? null}
            notice={params.aviso ?? null}
            error={params.erro ?? null}
          />
        ) : (
          <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            Nenhum plano disponivel no momento. Execute <code>npm run db:seed</code> para criar os planos.
          </div>
        )}
      </section>
    </main>
  );
}
