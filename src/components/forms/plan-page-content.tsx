"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock, CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSubscriptionAction } from "@/server/actions/subscription";

type TrialStatus = "active" | "expired";
type SubStatus = "ACTIVE" | "AUTHORIZED" | "PENDING" | "CANCELLED" | "PAUSED" | "EXPIRED" | "PAST_DUE" | null;

type Payment = {
  id: string;
  status: string;
  statusDetail: string | null;
  amountCents: number | null;
  currency: string | null;
  paidAt: string | null;
  payerEmail: string | null;
  createdAt: string;
};

type Props = {
  planName: string;
  planDescription: string | null;
  priceCents: number;
  trialDaysLeft: number;
  trialStatus: TrialStatus;
  subscriptionStatus: SubStatus;
  recentPayments: Payment[];
  notice: string | null;
  success: string | null;
  error: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativa",
  AUTHORIZED: "Autorizada",
  PENDING: "Pendente",
  CANCELLED: "Cancelada",
  PAUSED: "Pausada",
  EXPIRED: "Expirada",
  PAST_DUE: "Pagamento em atraso",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  in_process: "Em processamento",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  charged_back: "Estornado",
};

export function PlanPageContent({
  planName,
  planDescription,
  priceCents,
  trialDaysLeft,
  trialStatus,
  subscriptionStatus,
  recentPayments,
  notice,
  success,
  error,
}: Props) {
  const [, formAction, pending] = useActionState(createSubscriptionAction, undefined);

  const isSubscribed = subscriptionStatus === "ACTIVE" || subscriptionStatus === "AUTHORIZED";
  const isPending = subscriptionStatus === "PENDING";
  const canSubscribe = !isSubscribed && !isPending;
  const priceFormatted = `R$ ${(priceCents / 100).toFixed(2).replace(".", ",")}`;

  return (
    <div className="grid gap-6">
      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          {success === "assinatura-autorizada" && "Assinatura autorizada com sucesso! Seu acesso esta ativo."}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {notice === "aguardando-pagamento" && "Seu pagamento esta sendo processado. Aguarde a confirmacao."}
          {notice === "assinatura-existente" && "Voce ja tem uma assinatura em andamento."}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error === "mercadopago" && "Nao foi possivel conectar ao Mercado Pago. Tente novamente."}
          {error === "plano-nao-encontrado" && "Plano nao encontrado. Entre em contato com o suporte."}
          {error === "pagamento-cancelado" && "Pagamento cancelado. Tente novamente quando quiser."}
        </div>
      )}

      {/* Trial status */}
      <div
        className={[
          "flex items-center gap-3 rounded-lg border px-4 py-3",
          trialStatus === "active"
            ? "border-primary/30 bg-primary/10"
            : "border-destructive/30 bg-destructive/10",
        ].join(" ")}
      >
        <Clock
          className={[
            "size-5 shrink-0",
            trialStatus === "active" ? "text-primary" : "text-destructive",
          ].join(" ")}
        />
        <div>
          {trialStatus === "active" ? (
            <p className="text-sm font-medium text-primary">
              Trial ativo — {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm font-medium text-destructive">
              Trial expirado — assine para continuar usando
            </p>
          )}
          {isSubscribed && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Assinatura {STATUS_LABELS[subscriptionStatus ?? ""] ?? subscriptionStatus}
            </p>
          )}
        </div>
      </div>

      {/* Plan card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{planName}</h2>
            {planDescription && (
              <p className="mt-1 text-sm text-muted-foreground">{planDescription}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{priceFormatted}</p>
            <p className="text-xs text-muted-foreground">por mes</p>
          </div>
        </div>

        <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            7 dias gratuitos de trial
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Acesso completo a plataforma
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Suporte por WhatsApp
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Cancele quando quiser
          </li>
        </ul>

        <div className="mt-6">
          {isSubscribed ? (
            <div className="flex items-center gap-2 rounded-lg bg-primary/15 px-4 py-3 text-sm font-medium text-primary">
              <CheckCircle2 className="size-4" />
              Assinatura ativa — voce tem acesso completo
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Pagamento pendente — aguardando autorizacao do Mercado Pago
            </div>
          ) : canSubscribe ? (
            <form action={formAction}>
              <Button className="w-full" size="lg" disabled={pending} type="submit">
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    Assinar por {priceFormatted}/mes
                  </>
                )}
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Historico de pagamentos</h3>
        </div>
        {recentPayments.length > 0 ? (
          <div className="divide-y">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                    {payment.statusDetail ? ` — ${payment.statusDetail}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString("pt-BR")
                      : new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {payment.amountCents != null && (
                  <p className="text-sm font-semibold text-primary">
                    R$ {(payment.amountCents / 100).toFixed(2).replace(".", ",")}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            Nenhum pagamento registrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
