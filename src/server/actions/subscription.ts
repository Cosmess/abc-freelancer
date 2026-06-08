"use server";

import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/lib/auth/paths";
import {
  getPlanForRole,
  getLatestSubscriptionForUser,
  initSubscription,
} from "@/lib/mercadopago/subscription";
import { requireUser } from "@/server/guards/auth";

export async function createSubscriptionAction() {
  const user = await requireUser();

  // Do not allow ADMIN to subscribe
  if (user.role === "ADMIN") {
    redirect(getRoleHomePath(user.role));
  }

  // Block if user already has an active or pending subscription
  const existing = await getLatestSubscriptionForUser(user.id);
  if (existing && ["ACTIVE", "AUTHORIZED", "PENDING"].includes(existing.status)) {
    const planPath =
      user.role === "ESTABLISHMENT"
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
    redirect(`${planPath}?aviso=assinatura-existente`);
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
  } catch {
    const planPath =
      user.role === "ESTABLISHMENT"
        ? "/app/estabelecimento/plano"
        : "/app/freelancer/plano";
    redirect(`${planPath}?erro=mercadopago`);
  }

  redirect(checkoutUrl);
}
