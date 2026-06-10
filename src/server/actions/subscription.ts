"use server";

import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/lib/auth/paths";
import {
  cancelLatestPaidSubscriptionForUser,
  getPlanForRole,
  initSubscription,
} from "@/lib/mercadopago/subscription";
import { requireUser } from "@/server/guards/auth";

export async function createSubscriptionAction() {
  const user = await requireUser();

  // Do not allow ADMIN to subscribe
  if (user.role === "ADMIN") {
    redirect(getRoleHomePath(user.role));
  }

  const plan = await getPlanForRole(user.role);

  if (!plan) {
    const planPath =
      user.role === "ESTABLISHMENT"
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
    redirect(`${planPath}?erro=plano-nao-encontrado`);
  }

  let checkoutUrl: string;

  try {
    const result = await initSubscription({
      userId: user.id,
      userEmail: user.email,
      plan,
    });
    checkoutUrl = result.checkoutUrl;
  } catch (error) {
    console.error("[createSubscriptionAction] Mercado Pago checkout error:", error);
    const planPath =
      user.role === "ESTABLISHMENT"
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
    redirect(`${planPath}?erro=mercadopago`);
  }

  redirect(checkoutUrl);
}

export async function cancelSubscriptionAction() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    redirect(getRoleHomePath(user.role));
  }

  const planPath =
    user.role === "ESTABLISHMENT"
      ? "/app/estabelecimento/plano"
      : "/app/freelancer/plano";

  const cancelled = await cancelLatestPaidSubscriptionForUser(user.id);

  if (!cancelled) {
    redirect(`${planPath}?aviso=assinatura-nao-encontrada`);
  }

  redirect(`${planPath}?aviso=assinatura-cancelada`);
}
