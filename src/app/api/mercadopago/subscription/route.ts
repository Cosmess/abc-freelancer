import { NextResponse, type NextRequest } from "next/server";

import { syncPaymentFromMP } from "@/lib/mercadopago/subscription";
import { getCurrentUser } from "@/server/guards/auth";
import { UserRole } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const paymentId = params.get("payment_id") ?? params.get("collection_id");
  const status = params.get("status");

  // Try to sync from Mercado Pago
  try {
    if (paymentId) {
      await syncPaymentFromMP(paymentId);
    }
  } catch (err) {
    console.error("[checkout-redirect] sync error:", err);
  }

  // Determine redirect target based on logged-in user's role
  const user = await getCurrentUser();

  let planPath = "/login";

  if (user) {
    planPath =
      user.role === UserRole.ESTABLISHMENT
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
  }

  if (status === "approved") {
    return NextResponse.redirect(new URL(`${planPath}?sucesso=pagamento-aprovado`, request.url));
  }

  if (status === "cancelled" || status === "rejected" || status === "failure") {
    return NextResponse.redirect(new URL(`${planPath}?erro=pagamento-cancelado`, request.url));
  }

  return NextResponse.redirect(new URL(`${planPath}?aviso=aguardando-pagamento`, request.url));
}
