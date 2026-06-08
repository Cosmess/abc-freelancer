import { randomUUID } from "crypto";
import { Payment, PreApproval } from "mercadopago";

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
  mercadoPagoPreapprovalPlanId: string | null;
  active: boolean;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  planId: string;
  provider: string;
  status: string;
  mercadoPagoPreapprovalId: string | null;
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
  payerEmail: string | null;
  createdAt: string;
};

const MP_TO_DB_STATUS: Record<string, string> = {
  authorized: "AUTHORIZED",
  paused: "PAUSED",
  cancelled: "CANCELLED",
  pending: "PENDING",
};

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

export async function getRecentPaymentsForUser(
  userId: string,
  limit = 5,
): Promise<PaymentHistoryRecord[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("PaymentHistory")
    .select("id,userId,status,statusDetail,amountCents,currency,paidAt,payerEmail,createdAt")
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
  const backUrl = `${getAppUrl()}/api/mercadopago/subscription`;

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

  const preapproval = new PreApproval(getMercadoPagoClient());

  const body: Record<string, unknown> = {
    reason: input.plan.name,
    back_url: backUrl,
    payer_email: input.userEmail,
    external_reference: subscriptionId,
    status: "pending",
  };

  if (input.plan.mercadoPagoPreapprovalPlanId) {
    body.preapproval_plan_id = input.plan.mercadoPagoPreapprovalPlanId;
  } else {
    body.auto_recurring = {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: input.plan.priceCents / 100,
      currency_id: input.plan.currency,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpResponse = await preapproval.create({ body } as any);

  if (!mpResponse?.id || !mpResponse?.init_point) {
    await supabase.from("Subscription").delete().eq("id", subscriptionId);
    throw new Error("Mercado Pago nao retornou dados da assinatura.");
  }

  await supabase
    .from("Subscription")
    .update({ mercadoPagoPreapprovalId: String(mpResponse.id), updatedAt: new Date().toISOString() })
    .eq("id", subscriptionId);

  return { checkoutUrl: String(mpResponse.init_point) };
}

export async function syncSubscriptionFromMP(preapprovalId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const preapproval = new PreApproval(getMercadoPagoClient());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mp = await preapproval.get({ id: preapprovalId }) as any;

  if (!mp) return;

  const dbStatus = MP_TO_DB_STATUS[String(mp.status)] ?? "PENDING";
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("Subscription")
    .select("id")
    .eq("mercadoPagoPreapprovalId", preapprovalId)
    .maybeSingle<{ id: string }>();

  if (!existing) return;

  await supabase
    .from("Subscription")
    .update({
      status: dbStatus,
      mercadoPagoPayerId: mp.payer_id ? String(mp.payer_id) : null,
      startedAt: mp.date_created ? new Date(mp.date_created).toISOString() : null,
      currentPeriodStart: mp.next_payment_date
        ? new Date(mp.next_payment_date).toISOString()
        : null,
      cancelledAt:
        dbStatus === "CANCELLED" ? now : null,
      updatedAt: now,
    })
    .eq("id", existing.id);
}

export async function syncSubscriptionByExternalReference(
  externalReference: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { data: subscription } = await supabase
    .from("Subscription")
    .select("id,mercadoPagoPreapprovalId")
    .eq("id", externalReference)
    .maybeSingle<{ id: string; mercadoPagoPreapprovalId: string | null }>();

  if (subscription?.mercadoPagoPreapprovalId) {
    await syncSubscriptionFromMP(subscription.mercadoPagoPreapprovalId);
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
    rawPayload: mp,
    createdAt: now,
    updatedAt: now,
  });
}
