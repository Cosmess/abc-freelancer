# Security Review — OWASP Top 10

**Data:** 2026-06-10
**Stack:** Next.js 16 + React 19 + TypeScript + Supabase Auth/Postgres/Storage + Prisma ORM + Mercado Pago Checkout Pro

---

## Status das correções

| Severidade | Total | Corrigido |
|---|---|---|
| Critical | 1 | Sim |
| High | 5 | Sim |
| Medium | 11 | Sim |
| Low | 7 | Pendente (baixo risco) |

---

## A01 — Broken Access Control

### CORRIGIDO — Credenciais de produção expostas localmente (Critical)
Credenciais revogadas e rotacionadas no Supabase e Vercel. Arquivos `.env` / `.env.local` confirmados fora do histórico git.

### CORRIGIDO — `proxy.ts` não exportado como middleware
Criado `src/middleware.ts` exportando `proxy` como `middleware`. O Next.js só executa proteção de rotas via Edge se houver `middleware.ts` na raiz de `src/`.

### CORRIGIDO — Filtro de candidaturas vazava dados de todos os estabelecimentos
`getJobPostsByEstablishmentPaged` em `src/lib/jobs/job-store.ts` buscava `JobApplication` sem filtro de estabelecimento. Corrigido para primeiro buscar os `jobPostId` do estabelecimento e só então filtrar candidaturas dentro desse conjunto.

### CORRIGIDO — Checkout callback aceitava `payment_id` de outros usuários
`src/app/api/mercadopago/subscription/route.ts`: sync do pagamento agora só ocorre para sessões autenticadas, impedindo que qualquer visitante dispare operações de escrita arbitrárias.

### LOW — `requireActiveAccess` ausente em delete/close job
`deleteJobPostAction` e `closeJobPostAction` não verificam assinatura ativa. Decisão de design: operações destrutivas são permitidas a assinantes expirados intencionalmente. Documentar se for diferente.

---

## A02 — Cryptographic Failures

### CORRIGIDO — Credenciais em texto claro (ver A01 Critical acima)

### CORRIGIDO — Senha sem requisitos de complexidade
`src/lib/auth/validators.ts`: mínimo elevado de 8 para 10 caracteres, adicionada obrigatoriedade de ao menos 1 letra e 1 número.

### LOW — Validação de assinatura de webhook com lógica condicional sutil
`src/app/api/mercadopago/webhook/route.ts`: fluxo correto, mas frágil a refatorações. Adicionar testes unitários para os casos: secret configurado sem headers, assinatura inválida, `isDashboardTest` com `live_mode=true`.

---

## A03 — Injection

### OK — SQL Injection ausente
Uso exclusivo de Supabase PostgREST client e Prisma ORM parametrizados. Zero SQL raw.

### OK — Command Injection ausente
Nenhum uso de `exec`, `spawn` ou `child_process` no código da aplicação.

### CORRIGIDO — Filtros `ilike` sem limite de tamanho (DoS por query lenta)
`.slice(0, 100)` adicionado em todos os filtros `ilike` em `src/lib/jobs/job-store.ts` e `src/lib/profiles/profile-store.ts`.

---

## A04 — Insecure Design

### CORRIGIDO — Sem rate limiting em auth e endpoint de CEP
Criado `src/lib/rate-limit.ts` (sliding window por IP, 30 req/min). Aplicado em `GET /api/lookup/cep`. Para auth, o Supabase já limita operações do lado do provedor.

> **Nota:** o rate limiter atual é in-process (por instância serverless). Para proteção distribuída, migrar para Upstash Redis com `@upstash/ratelimit`.

### CORRIGIDO — `findAuthUserByEmail` listava até 1000 usuários
Função removida. `confirmAuthEmailIfInternallyVerified` agora usa `auth.admin.getUserById(supabaseAuthUserId)` — O(1) em vez de O(n).

### CORRIGIDO — Erros internos de banco expostos ao cliente
`src/server/actions/jobs.ts` e `src/server/actions/profile.ts`: erros são logados server-side via `logError()` e o cliente recebe apenas mensagem genérica.

---

## A05 — Security Misconfiguration

### CORRIGIDO — CSP com `unsafe-eval` em `script-src`
`next.config.ts`: removido `unsafe-eval`. Mantido `unsafe-inline` em `script-src` enquanto não há migração para CSP baseado em nonce (Next.js App Router suporta via middleware).

### CORRIGIDO — `X-XSS-Protection` obsoleto
Header removido de `next.config.ts`. Navegadores modernos ignoram ou se comportam de forma imprevisível com ele.

### CORRIGIDO — `NEXT_PUBLIC_APP_URL` com `\r\n` literal
`src/lib/auth/paths.ts`: `getAppUrl()` agora limpa tanto sequências literais `\r\n` quanto caracteres reais de CR/LF antes de retornar a URL.

### LOW — Singleton do cliente admin Supabase
`src/lib/supabase/admin.ts`: usa variável de módulo com `persistSession: false` e `autoRefreshToken: false`. Correto para Vercel serverless. Manter sem estado de sessão do usuário.

---

## A06 — Vulnerable and Outdated Components

### CORRIGIDO — Sem auditoria automática de dependências
Script `"audit": "npm audit --audit-level=high"` adicionado em `package.json`. Executar no CI/CD. Considerar Dependabot para alertas automáticos de CVEs.

---

## A07 — Identification and Authentication Failures

### OK — Autenticação implementada corretamente
`supabase.auth.getUser()` server-side, roles lidos da tabela interna (não do JWT), verificação de email obrigatória antes do login.

### LOW — Enumeração parcial de emails no login
Quando o email não está verificado, a resposta inclui `emailNotVerified: true`. Trade-off de UX documentado e intencional.

### LOW — Sync de usuário em todo request autenticado
`syncInternalUserFromSupabaseUser` executa UPDATE a cada request. Memoizado por `cache()` dentro do request, mas gera escrita desnecessária quando nada mudou. Otimização futura: comparar valores antes de atualizar.

---

## A08 — Software and Data Integrity Failures

### OK — Integridade de pagamentos
Unique constraint em `(provider, mercadoPagoPaymentId)`, idempotency key no reembolso (`refund:${paymentId}`), `external_reference` validado contra `Subscription` antes de qualquer atualização.

### LOW — Bypass de dashboard test sem restrição de ambiente
`src/app/api/mercadopago/webhook/route.ts`: payload com `live_mode=false` e `dataId=123456` retorna `200 { received: true, test: true }` sem assinatura. Impacto baixo (não processa nada), mas confirma que o endpoint está ativo. Restringir em `NODE_ENV === "production"` se necessário.

---

## A09 — Security Logging and Monitoring Failures

### CORRIGIDO — Logging estruturado implementado
Criado `src/lib/logger.ts` com `logSecurity()` e `logError()` (saída JSON estruturado).

Eventos instrumentados:
- `auth.login.success` / `auth.login.failure` / `auth.login.email_not_verified`
- `auth.signup.success` / `auth.signup.failure`
- `auth.logout`
- `payment.webhook.received` / `payment.webhook.invalid_signature` / `payment.webhook.missing_signature`
- `payment.sync.error`
- `rate_limit.exceeded`

> **Próximo passo:** configurar Vercel Log Drains ou Sentry para persistir e alertar sobre eventos de segurança em produção.

---

## A10 — Server-Side Request Forgery (SSRF)

### OK — Endpoint `/api/lookup/cep` sem SSRF explorável
CEP sanitizado com `.replace(/\D/g, "")` + validação de 8 dígitos. Domínio destino fixo em `viacep.com.br`.

### CORRIGIDO — `getAppUrl()` sem validação robusta
`src/lib/auth/paths.ts`: URL agora limpa CR/LF literais e reais antes de ser usada em `notification_url` e `callbackUrl` enviados ao Mercado Pago.

---

## O que está bem implementado (sem achados)

- Todas as queries de escrita e leitura sensíveis usam `establishmentId`/`freelancerId` derivado da sessão, não de input do usuário
- Upload de fotos: validação de MIME type e tamanho máximo server-side antes do upload
- IDOR em candidaturas prevenido: vaga sempre validada contra o estabelecimento logado
- Headers HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy configurados
- Zero SQL raw em todo o codebase

---

## Pendências (Low)

1. Adicionar testes unitários para validação de assinatura do webhook (A02)
2. Avaliar `requireActiveAccess` em delete/close job (A01)
3. Migrar rate limiter para Upstash Redis para proteção cross-instance (A04)
4. Configurar Vercel Log Drains ou Sentry para persistência de logs (A09)
5. Restringir bypass de dashboard test do webhook em produção (A08)
6. Otimizar `syncInternalUserFromSupabaseUser` para não escrever quando nada mudou (A07)
