import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  syncSubscriptionFromMP,
  recordPaymentFromMP,
} from "@/lib/mercadopago/subscription";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dataId =
    request.nextUrl.searchParams.get("data.id") ??
    (body?.data as Record<string, unknown>)?.id?.toString() ??
    "";

  // Validate HMAC signature (skip in dev if secret not configured)
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature") ?? "",
        xRequestId: request.headers.get("x-request-id") ?? "",
        dataId,
        secret,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      return NextResponse.json({ error: "Signature error" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdminClient();
  const eventId = body.id ? String(body.id) : null;
  const requestId = request.headers.get("x-request-id") ?? null;
  const action = typeof body.action === "string" ? body.action : null;
  const type = typeof body.type === "string" ? body.type : null;

  // Idempotency: store event, skip if duplicate
  const { error: insertError } = await supabase
    .from("MercadoPagoWebhookEvent")
    .insert({
      id: randomUUID(),
      eventId,
      type,
      action,
      dataId: dataId || null,
      requestId,
      signature: request.headers.get("x-signature"),
      payload: body,
      createdAt: new Date().toISOString(),
    });

  if (insertError?.code === "23505") {
    // Duplicate — already processed or in progress
    return NextResponse.json({ received: true });
  }

  if (insertError) {
    console.error("[webhook] Failed to store event:", insertError.message);
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  // Process asynchronously (respond 200 quickly, then process)
  processWebhookEvent({ type, dataId, body }).catch((err) => {
    console.error("[webhook] Processing error:", err);
  });

  return NextResponse.json({ received: true });
}

async function processWebhookEvent(input: {
  type: string | null;
  dataId: string;
  body: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();

  try {
    if (input.type === "subscription_preapproval" && input.dataId) {
      await syncSubscriptionFromMP(input.dataId);
    } else if (input.type === "payment" && input.dataId) {
      // Find user via subscription linked to this payment
      const { data: sub } = await supabase
        .from("Subscription")
        .select("id,userId")
        .eq(
          "mercadoPagoPreapprovalId",
          (input.body?.data as Record<string, unknown>)?.preapproval_id?.toString() ?? "__none__",
        )
        .maybeSingle<{ id: string; userId: string }>();

      if (sub) {
        await recordPaymentFromMP({
          userId: sub.userId,
          paymentId: input.dataId,
          subscriptionId: sub.id,
        });
      }
    }

    // Mark as processed
    if (input.dataId) {
      await supabase
        .from("MercadoPagoWebhookEvent")
        .update({ processedAt: new Date().toISOString() })
        .eq("dataId", input.dataId)
        .eq("type", input.type ?? "");
    }
  } catch (err) {
    console.error("[webhook] processWebhookEvent failed:", err);
  }
}
