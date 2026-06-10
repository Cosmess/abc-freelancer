"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock, CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction, createSubscriptionAction } from "@/server/actions/subscription";

type TrialStatus = "active" | "expired";
type SubStatus =
  | "ACTIVE"
  | "AUTHORIZED"
  | "PENDING"
  | "CANCELLED"
  | "PAUSED"
  | "EXPIRED"
  | "PAST_DUE"
  | null;

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
  referenceNow: string;
  trialStartsAt: string | Date;
  trialEndsAt: string | Date;
  trialDaysLeft: number;
  trialStatus: TrialStatus;
  subscriptionStatus: SubStatus;
  subscriptionStartedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  recentPayments: Payment[];
  notice: string | null;
  success: string | null;
  error: string | null;
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

function formatDate(value: string | Date | null) {
  if (!value) return "Nao informado";

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PlanPageContent({
  planName,
  planDescription,
  priceCents,
  referenceNow,
  trialStartsAt,
  trialEndsAt,
  trialDaysLeft,
  trialStatus,
  subscriptionStatus,
  subscriptionStartedAt,
  currentPeriodStart,
  currentPeriodEnd,
  recentPayments,
  notice,
  success,
  error,
}: Props) {
  const [, formAction, pending] = useActionState(createSubscriptionAction, undefined);
  const [, cancelFormAction, cancelPending] = useActionState(cancelSubscriptionAction, undefined);
  const referenceNowMs = new Date(referenceNow).getTime();

  const isActiveSubscription =
    subscriptionStatus === "ACTIVE" || subscriptionStatus === "AUTHORIZED";
  const paidUntil = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
  const hasPaidAccess = Boolean(paidUntil && paidUntil.getTime() > referenceNowMs && subscriptionStatus);
  const daysRemaining = paidUntil
    ? Math.max(0, Math.ceil((paidUntil.getTime() - referenceNowMs) / 86_400_000))
    : 0;
  const isCancelledWithAccess = subscriptionStatus === "CANCELLED" && hasPaidAccess;
  const isPaidSubscription = hasPaidAccess && subscriptionStatus !== null;
  const isPending = subscriptionStatus === "PENDING";
  const priceFormatted = `R$ ${(priceCents / 100).toFixed(2).replace(".", ",")}`;
  const latestApprovedPayment = recentPayments.find((payment) => payment.status === "approved");
  const paymentDate = latestApprovedPayment?.paidAt ?? null;
  const planStartedAt = currentPeriodStart ?? subscriptionStartedAt;

  return (
    <div className="grid gap-6">
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          {success === "pagamento-aprovado" &&
            "Pagamento aprovado com sucesso! Seu acesso esta ativo."}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {notice === "aguardando-pagamento" &&
            "Seu pagamento esta sendo processado. Aguarde a confirmacao do Mercado Pago."}
          {notice === "assinatura-existente" && "Voce ja tem acesso ativo."}
          {notice === "assinatura-cancelada" && "Assinatura cancelada com sucesso."}
          {notice === "assinatura-nao-encontrada" &&
            "Nenhuma assinatura ativa foi encontrada para cancelar."}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error === "mercadopago" &&
            "Nao foi possivel conectar ao Mercado Pago. Tente novamente."}
          {error === "plano-nao-encontrado" &&
            "Plano nao encontrado. Entre em contato com o suporte."}
          {error === "pagamento-cancelado" &&
            "Pagamento cancelado. Tente novamente quando quiser."}
        </div>
      )}

      {subscriptionStatus === "CANCELLED" ? (
        <div
          className={[
            "flex items-center gap-3 rounded-lg border px-4 py-3",
            isCancelledWithAccess
              ? "border-primary/30 bg-primary/10"
              : "border-destructive/30 bg-destructive/10",
          ].join(" ")}
        >
          <Clock
            className={[
              "size-5 shrink-0",
              isCancelledWithAccess ? "text-primary" : "text-destructive",
            ].join(" ")}
          />
          <div>
            <p
              className={[
                "text-sm font-medium",
                isCancelledWithAccess ? "text-primary" : "text-destructive",
              ].join(" ")}
            >
              Assinatura cancelada
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isCancelledWithAccess
                ? `Voce ainda pode usar por ${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""} antes do bloqueio.`
                : "O acesso desta assinatura ja foi encerrado."}
            </p>
          </div>
        </div>
      ) : !isPaidSubscription && (
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
                Trial ativo - {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante
              </p>
            ) : (
              <p className="text-sm font-medium text-destructive">
                Trial expirado - assine para continuar usando
              </p>
            )}
          </div>
        </div>
      )}

      {isPaidSubscription && subscriptionStatus !== "CANCELLED" && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <Clock className="size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-primary">
              {isCancelledWithAccess ? "Assinatura cancelada" : "Assinatura ativa"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isCancelledWithAccess
                ? `Voce ainda pode usar por ${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""} antes do bloqueio.`
                : `Voce ainda pode usar por ${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""}.`}
            </p>
          </div>
        </div>
      )}

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
            Cancele quando quiser
          </li>
        </ul>

        <div className="mt-5 grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Trial gratis</p>
            <p className="mt-1 font-medium">
              {formatDate(trialStartsAt)} ate {formatDate(trialEndsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Pagamento do plano</p>
            <p className="mt-1 font-medium">{formatDate(paymentDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Inicio do plano</p>
            <p className="mt-1 font-medium">{formatDate(planStartedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Expira em</p>
            <p className="mt-1 font-medium">{formatDate(currentPeriodEnd)}</p>
          </div>
        </div>

        <div className="mt-6">
          {isPaidSubscription ? (
            <div className="grid gap-3 rounded-lg bg-primary/10 px-4 py-3">
              <form action={formAction}>
                <Button className="w-full" disabled={pending} type="submit" variant="outline">
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Renovar por {priceFormatted}/mes
                    </>
                  )}
                </Button>
              </form>

              {isActiveSubscription && (
                <form action={cancelFormAction}>
                  <Button
                    className="w-full"
                    disabled={cancelPending}
                    type="submit"
                    variant="destructive"
                  >
                    {cancelPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Aguarde...
                      </>
                    ) : (
                      "Cancelar plano"
                    )}
                  </Button>
                </form>
              )}
            </div>
          ) : isPending ? (
            <div className="grid gap-3 rounded-lg bg-muted px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Pagamento pendente - aguardando confirmacao do Mercado Pago
              </div>
              <form action={formAction}>
                <Button className="w-full" disabled={pending} type="submit" variant="outline">
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Tentar pagamento novamente
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
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
          )}
        </div>
      </div>

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
                    {payment.statusDetail ? ` - ${payment.statusDetail}` : ""}
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
