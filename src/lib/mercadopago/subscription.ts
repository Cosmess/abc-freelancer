import { randomUUID } from "crypto";
import { Payment, PaymentRefund, Preference } from "mercadopago";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/auth/paths";
import { getMercadoPagoClient } from "./client";

export type PlanRecord = {
  id: string;
  role: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  trialDays: number;
  active: boolean;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  planId: string;
  provider: string;
  status: string;
  mercadoPagoPreapprovalId: string | null;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoPayerId: string | null;
  startedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentHistoryRecord = {
  id: string;
  userId: string;
  status: string;
  statusDetail: string | null;
  amountCents: number | null;
  currency: string | null;
  paidAt: string | null;
  mercadoPagoPaymentId: string | null;
  mercadoPagoRefundId: string | null;
  refundStatus: string | null;
  refundAmountCents: number | null;
  refundedAt: string | null;
  payerEmail: string | null;
  createdAt: string;
};

const PLAN_PERIOD_DAYS = 30;
const REFUND_WINDOW_DAYS = 7;
const REFUND_WINDOW_MS = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const ACTIVE_SUBSCRIPTION_STATUSES = ["ACTIVE", "AUTHORIZED"];

export async function getPlanForRole(role: string): Promise<PlanRecord | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("Plan")
    .select("*")
    .eq("role", role)
    .eq("active", true)
    .limit(1)
    .maybeSingle<PlanRecord>();

  if (error) throw error;
  return data;
}

export async function getLatestSubscriptionForUser(userId: string): Promise<SubscriptionRecord | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("Subscription")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRecord>();

  if (error) throw error;
  return data;
}

export async function getLatestActiveSubscriptionForUser(
  userId: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("Subscription")
    .select("*")
    .eq("userId", userId)
    .in("status", ACTIVE_SUBSCRIPTION_STATUSES)
    .gt("currentPeriodEnd", new Date().toISOString())
    .order("currentPeriodEnd", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRecord>();

  if (error) throw error;
  return data;
}

export async function getLatestPaidSubscriptionForUser(
  userId: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("Subscription")
    .select("*")
    .eq("userId", userId)
    .in("status", ["ACTIVE", "AUTHORIZED", "CANCELLED"])
    .gt("currentPeriodEnd", new Date().toISOString())
    .order("currentPeriodEnd", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRecord>();

  if (error) throw error;
  return data;
}

export async function getCurrentSubscriptionForUser(
  userId: string,
): Promise<SubscriptionRecord | null> {
  const active = await getLatestActiveSubscriptionForUser(userId);

  if (active) return active;

  return getLatestSubscriptionForUser(userId);
}

export async function getRecentPaymentsForUser(
  userId: string,
  limit = 5,
): Promise<PaymentHistoryRecord[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("PaymentHistory")
    .select(
      "id,userId,status,statusDetail,amountCents,currency,paidAt,mercadoPagoPaymentId,mercadoPagoRefundId,refundStatus,refundAmountCents,refundedAt,payerEmail,createdAt",
    )
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(limit)
    .returns<PaymentHistoryRecord[]>();

  if (error) throw error;
  return data ?? [];
}

export async function initSubscription(input: {
  userId: string;
  userEmail: string;
  plan: PlanRecord;
}): Promise<{ checkoutUrl: string }> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const subscriptionId = randomUUID();
  const appUrl = getAppUrl();
  const callbackUrl = `${appUrl}/api/mercadopago/subscription`;
  const webhookUrl = `${appUrl}/api/mercadopago/webhook`;

  const { error: insertError } = await supabase
    .from("Subscription")
    .insert({
      id: subscriptionId,
      userId: input.userId,
      planId: input.plan.id,
      provider: "MERCADO_PAGO",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

  if (insertError) throw insertError;

  const preference = new Preference(getMercadoPagoClient());

  const body: Record<string, unknown> = {
    items: [
      {
        id: input.plan.id,
        title: input.plan.name,
        description: input.plan.description ?? undefined,
        quantity: 1,
        unit_price: input.plan.priceCents / 100,
        currency_id: input.plan.currency,
      },
    ],
    payer: {
      email: input.userEmail,
    },
    external_reference: subscriptionId,
    notification_url: webhookUrl,
    back_urls: {
      success: callbackUrl,
      failure: callbackUrl,
      pending: callbackUrl,
    },
    auto_return: "approved",
    metadata: {
      subscription_id: subscriptionId,
      user_id: input.userId,
      plan_id: input.plan.id,
    },
  };

  let mpResponse: Awaited<ReturnType<Preference["create"]>>;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mpResponse = await preference.create({ body } as any);
  } catch (error) {
    await supabase.from("Subscription").delete().eq("id", subscriptionId);
    throw error;
  }

  if (!mpResponse?.id || !mpResponse?.init_point) {
    await supabase.from("Subscription").delete().eq("id", subscriptionId);
    throw new Error("Mercado Pago nao retornou dados do checkout.");
  }

  await supabase
    .from("Subscription")
    .update({
      mercadoPagoPreferenceId: String(mpResponse.id),
      updatedAt: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  return { checkoutUrl: String(mpResponse.init_point) };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function syncPaymentFromMP(paymentId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const paymentClient = new Payment(getMercadoPagoClient());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mp = await paymentClient.get({ id: Number(paymentId) }) as any;
  if (!mp) return;

  const subscriptionId =
    mp.external_reference ??
    mp.metadata?.subscription_id ??
    mp.metadata?.subscriptionId ??
    null;

  if (!subscriptionId) return;

  const { data: subscription } = await supabase
    .from("Subscription")
    .select("id,userId,planId")
    .eq("id", String(subscriptionId))
    .maybeSingle<{
      id: string;
      userId: string;
      planId: string;
    }>();

  if (!subscription) return;

  await recordPaymentFromMP({
    userId: subscription.userId,
    paymentId,
    subscriptionId: subscription.id,
  });

  const status = String(mp.status ?? "");
  const now = new Date();

  if (status === "approved") {
    const paidAt = mp.date_approved ? new Date(mp.date_approved) : now;
    const periodStart = paidAt;
    const periodEnd = addDays(periodStart, PLAN_PERIOD_DAYS);
    const periodStartIso = periodStart.toISOString();

    await supabase
      .from("Subscription")
      .update({
        status: "EXPIRED",
        currentPeriodEnd: periodStartIso,
        updatedAt: now.toISOString(),
      })
      .eq("userId", subscription.userId)
      .neq("id", subscription.id)
      .in("status", ACTIVE_SUBSCRIPTION_STATUSES)
      .gt("currentPeriodEnd", periodStartIso);

    await supabase
      .from("Subscription")
      .update({
        status: "ACTIVE",
        mercadoPagoPayerId: mp.payer?.id ? String(mp.payer.id) : null,
        startedAt: periodStartIso,
        currentPeriodStart: periodStartIso,
        currentPeriodEnd: periodEnd.toISOString(),
        cancelledAt: null,
        updatedAt: now.toISOString(),
      })
      .eq("id", subscription.id);

    await supabase
      .from("User")
      .update({
        trialEndsAt: periodStartIso,
        updatedAt: now.toISOString(),
      })
      .eq("id", subscription.userId);
  } else if (["cancelled", "rejected"].includes(status)) {
    await supabase
      .from("Subscription")
      .update({
        status: "CANCELLED",
        cancelledAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .eq("id", subscription.id)
      .eq("status", "PENDING");
  }
}

export async function recordPaymentFromMP(input: {
  userId: string;
  paymentId: string;
  subscriptionId?: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const existing = await supabase
    .from("PaymentHistory")
    .select("id")
    .eq("provider", "MERCADO_PAGO")
    .eq("mercadoPagoPaymentId", input.paymentId)
    .maybeSingle<{ id: string }>();

  if (existing.data) return; // already recorded

  const paymentClient = new Payment(getMercadoPagoClient());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mp = await paymentClient.get({ id: Number(input.paymentId) }) as any;
  if (!mp) return;

  const now = new Date().toISOString();

  await supabase.from("PaymentHistory").insert({
    id: randomUUID(),
    userId: input.userId,
    subscriptionId: input.subscriptionId ?? null,
    provider: "MERCADO_PAGO",
    mercadoPagoPaymentId: input.paymentId,
    mercadoPagoPreapprovalId: mp.preapproval_id ? String(mp.preapproval_id) : null,
    externalReference: mp.external_reference ?? null,
    status: String(mp.status ?? ""),
    statusDetail: mp.status_detail ? String(mp.status_detail) : null,
    amountCents: mp.transaction_amount ? Math.round(Number(mp.transaction_amount) * 100) : null,
    currency: mp.currency_id ? String(mp.currency_id) : null,
    paymentMethodId: mp.payment_method_id ? String(mp.payment_method_id) : null,
    paymentTypeId: mp.payment_type_id ? String(mp.payment_type_id) : null,
    payerEmail: mp.payer?.email ? String(mp.payer.email) : null,
    paidAt: mp.date_approved ? new Date(mp.date_approved).toISOString() : null,
    mercadoPagoRefundId: null,
    refundStatus: null,
    refundAmountCents: null,
    refundedAt: null,
    rawPayload: mp,
    createdAt: now,
    updatedAt: now,
  });
}

async function getLatestApprovedPaymentForSubscription(subscriptionId: string): Promise<PaymentHistoryRecord | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("PaymentHistory")
    .select(
      "id,userId,status,statusDetail,amountCents,currency,paidAt,mercadoPagoPaymentId,mercadoPagoRefundId,refundStatus,refundAmountCents,refundedAt,payerEmail,createdAt",
    )
    .eq("subscriptionId", subscriptionId)
    .eq("provider", "MERCADO_PAGO")
    .eq("status", "approved")
    .order("paidAt", { ascending: false })
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle<PaymentHistoryRecord>();

  if (error) throw error;
  return data;
}

function isWithinRefundWindow(paidAt: string | null, now = new Date()): boolean {
  if (!paidAt) return false;

  const paidAtTime = new Date(paidAt).getTime();
  if (Number.isNaN(paidAtTime)) return false;

  return now.getTime() - paidAtTime <= REFUND_WINDOW_MS;
}

function toCents(amount: number | null | undefined): number | null {
  if (amount == null) return null;
  return Math.round(Number(amount) * 100);
}

export type CancelSubscriptionOutcome = "cancelled" | "refunded" | "not_found";

export async function cancelLatestPaidSubscriptionForUser(
  userId: string,
): Promise<CancelSubscriptionOutcome> {
  const supabase = getSupabaseAdminClient();
  const subscription = await getLatestPaidSubscriptionForUser(userId);

  if (!subscription) return "not_found";

  const payment = await getLatestApprovedPaymentForSubscription(subscription.id);
  const now = new Date();
  const nowIso = now.toISOString();
  const paymentId = payment?.mercadoPagoPaymentId ? Number(payment.mercadoPagoPaymentId) : null;
  const paidAt = payment?.paidAt ?? subscription.startedAt;
  const refundEligible = Boolean(paymentId && isWithinRefundWindow(paidAt, now));

  if (refundEligible) {
    if (!payment) {
      throw new Error("Pagamento aprovado nao encontrado para reembolso.");
    }

    const alreadyRefunded = Boolean(payment?.refundStatus || payment?.refundedAt || payment?.mercadoPagoRefundId);

    if (!alreadyRefunded) {
      const refundClient = new PaymentRefund(getMercadoPagoClient());
      const refund = await refundClient.total({
        payment_id: paymentId as number,
        requestOptions: {
          idempotencyKey: `refund:${paymentId}`,
        },
      });

      if (!refund?.id) {
        throw new Error("Mercado Pago nao retornou dados do reembolso.");
      }

      const refundDate = refund.date_created ? new Date(refund.date_created).toISOString() : nowIso;

      const { error: paymentUpdateError } = await supabase
        .from("PaymentHistory")
        .update({
          mercadoPagoRefundId: String(refund.id),
          refundStatus: refund.status ? String(refund.status) : "approved",
          refundAmountCents: toCents(refund.amount_refunded_to_payer ?? refund.amount),
          refundedAt: refundDate,
          updatedAt: nowIso,
        })
        .eq("id", payment.id)
        .select("id")
        .maybeSingle<{ id: string }>();

      if (paymentUpdateError) throw paymentUpdateError;
    }

    const { error } = await supabase
      .from("Subscription")
      .update({
        status: "CANCELLED",
        currentPeriodEnd: nowIso,
        cancelledAt: nowIso,
        updatedAt: nowIso,
      })
      .eq("id", subscription.id)
      .in("status", ["ACTIVE", "AUTHORIZED", "CANCELLED"])
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error) throw error;
    return "refunded";
  }

  const { error, data } = await supabase
    .from("Subscription")
    .update({
      status: "CANCELLED",
      cancelledAt: nowIso,
      updatedAt: nowIso,
    })
    .eq("id", subscription.id)
    .in("status", ["ACTIVE", "AUTHORIZED"])
    .gt("currentPeriodEnd", nowIso)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) throw error;
  if (!data) return "not_found";
  return "cancelled";
}
