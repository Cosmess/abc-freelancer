import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { logSecurity } from "@/lib/logger";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export async function GET(request: NextRequest) {
  const rateLimitResult = checkRateLimit(
    getRateLimitKey("cep", request),
    30,
    60,
  );

  if (rateLimitResult.limited) {
    logSecurity("rate_limit.exceeded", { endpoint: "/api/lookup/cep" });
    return NextResponse.json(
      { message: "Muitas requisicoes. Aguarde um momento." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds) },
      },
    );
  }

  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "") ?? "";

  if (cep.length !== 8) {
    return NextResponse.json({ message: "CEP invalido." }, { status: 400 });
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Nao foi possivel consultar o CEP." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    return NextResponse.json({ message: "CEP nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    cep: data.cep?.replace(/\D/g, "") ?? cep,
    state: data.uf ?? "",
    city: data.localidade ?? "",
    neighborhood: data.bairro ?? "",
    street: data.logradouro ?? "",
  });
}
