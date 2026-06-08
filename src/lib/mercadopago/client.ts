import { MercadoPagoConfig } from "mercadopago";

import { requireEnv } from "@/lib/env";

let mercadoPagoClient: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!mercadoPagoClient) {
    mercadoPagoClient = new MercadoPagoConfig({
      accessToken: requireEnv("MERCADO_PAGO_ACCESS_TOKEN"),
    });
  }

  return mercadoPagoClient;
}
