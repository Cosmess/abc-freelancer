import { NextResponse, type NextRequest } from "next/server";

import { syncPaymentFromMP } from "@/lib/mercadopago/subscription";
import { getCurrentUser } from "@/server/guards/auth";
import { logError } from "@/lib/logger";
import { UserRole } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const paymentId = params.get("payment_id") ?? params.get("collection_id");
  const status = params.get("status");

  // Resolve user first — only sync for authenticated sessions to prevent
  // unauthenticated callers from triggering arbitrary payment lookups.
  const user = await getCurrentUser();

  if (paymentId && user) {
    try {
      await syncPaymentFromMP(paymentId);
    } catch (err) {
      logError("checkout-redirect sync error", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  let planPath = "/login";

  if (user) {
    planPath = user.role === UserRole.ESTABLISHMENT
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
