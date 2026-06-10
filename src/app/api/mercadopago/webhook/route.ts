import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

import { syncPaymentFromMP } from "@/lib/mercadopago/subscription";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const isDashboardTest = body.live_mode === false && dataId === "123456";
  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret && !isDashboardTest) {
    console.error(
      "[webhook] MERCADO_PAGO_WEBHOOK_SECRET nao configurado - rejeitar requisicao",
    );
    return NextResponse.json(
      { error: "Webhook nao configurado no servidor" },
      { status: 500 },
    );
  }

  if (secret && xSignature && xRequestId) {
    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        return NextResponse.json({ error: "Assinatura invalida" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Erro na validacao da assinatura" },
        { status: 401 },
      );
    }
  } else if (!isDashboardTest) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 401 });
  }

  if (isDashboardTest) {
    return NextResponse.json({ received: true, test: true });
  }

  const supabase = getSupabaseAdminClient();
  const eventId = body.id ? String(body.id) : null;
  const requestId = xRequestId || null;
  const action = typeof body.action === "string" ? body.action : null;
  const type = typeof body.type === "string" ? body.type : null;

  const { error: insertError } = await supabase
    .from("MercadoPagoWebhookEvent")
    .insert({
      id: randomUUID(),
      eventId,
      type,
      action,
      dataId: dataId || null,
      requestId,
      signature: xSignature || null,
      payload: body,
      createdAt: new Date().toISOString(),
    });

  if (insertError?.code === "23505") {
    return NextResponse.json({ received: true, test: isDashboardTest });
  }

  if (insertError) {
    console.error("[webhook] Failed to store event:", insertError.message);
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  if (!isDashboardTest) {
    processWebhookEvent({ type, dataId }).catch((err) => {
      console.error("[webhook] Processing error:", err);
    });
  }

  return NextResponse.json({ received: true, test: isDashboardTest });
}

async function processWebhookEvent(input: {
  type: string | null;
  dataId: string;
}) {
  const supabase = getSupabaseAdminClient();

  try {
    if (input.type === "payment" && input.dataId) {
      await syncPaymentFromMP(input.dataId);
    }

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
