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
  let result: Awaited<ReturnType<typeof cancelLatestPaidSubscriptionForUser>>;

  try {
    result = await cancelLatestPaidSubscriptionForUser(user.id);
  } catch (error) {
    console.error("[cancelSubscriptionAction] Mercado Pago cancellation error:", error);
    redirect(`${planPath}?erro=reembolso`);
  }

  if (result === "refunded") {
    redirect(`${planPath}?aviso=reembolso-aprovado`);
  }

  if (result === "cancelled") {
    redirect(`${planPath}?aviso=assinatura-cancelada`);
  }

  redirect(`${planPath}?aviso=assinatura-nao-encontrada`);
}
