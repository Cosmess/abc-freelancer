import { NextResponse, type NextRequest } from "next/server";

import {
  syncSubscriptionFromMP,
  syncSubscriptionByExternalReference,
} from "@/lib/mercadopago/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/server/guards/auth";
import { getRoleHomePath } from "@/lib/auth/paths";
import { UserRole } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const preapprovalId = params.get("preapproval_id");
  const externalReference = params.get("external_reference");
  const status = params.get("status");

  // Try to sync from Mercado Pago
  try {
    if (preapprovalId) {
      await syncSubscriptionFromMP(preapprovalId);
    } else if (externalReference) {
      await syncSubscriptionByExternalReference(externalReference);
    }
  } catch (err) {
    console.error("[subscription-redirect] sync error:", err);
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

  if (status === "authorized") {
    return NextResponse.redirect(new URL(`${planPath}?sucesso=assinatura-autorizada`, request.url));
  }

  if (status === "cancelled" || status === "rejected") {
    return NextResponse.redirect(new URL(`${planPath}?erro=pagamento-cancelado`, request.url));
  }

  return NextResponse.redirect(new URL(`${planPath}?aviso=aguardando-pagamento`, request.url));
}
