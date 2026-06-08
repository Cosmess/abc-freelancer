# ABC Freelancer - Plano de Implementacao

## 1. Objetivo do produto

Construir um MVP web para conectar estabelecimentos do ABCD Paulista com freelancers/diaristas disponiveis para trabalhos por data, horario, cidade, bairro e especialidade.

O fluxo principal do MVP e:

1. Freelancer ou estabelecimento cria conta.
2. Usuario confirma email com codigo/link enviado pelo Supabase Auth.
3. Usuario completa o perfil.
4. Sistema concede 7 dias gratis a partir da data de cadastro.
5. Estabelecimento cria vagas.
6. Freelancer consulta vagas e se candidata.
7. Estabelecimento aceita ou recusa candidatura.
8. Apos aceite, o contato pode ser liberado.
9. Ao fim do periodo gratis, o usuario precisa manter assinatura ativa via Mercado Pago.

Regiao inicial:

- Santo Andre
- Sao Bernardo do Campo
- Sao Caetano do Sul
- Diadema
- Maua
- Ribeirao Pires
- Rio Grande da Serra

## 2. Stack definida

- Next.js App Router
- TypeScript
- SSR com Server Components
- Server Actions para mutacoes internas
- Route Handlers para webhooks e endpoints internos
- Supabase Auth
- Supabase Postgres
- Prisma
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Mercado Pago Assinaturas
- BrasilAPI para consulta de CNPJ
- ViaCEP para consulta de CEP
- Vercel para deploy

## 3. Principios de arquitetura

O projeto deve priorizar renderizacao e validacao no servidor.

- Paginas privadas devem ser Server Components sempre que possivel.
- Dados sensiveis nao devem ser carregados via client sem necessidade.
- Server Actions devem validar sessao, role, assinatura e propriedade do recurso.
- Route Handlers devem ser usados para webhooks, lookups externos e integracoes que exigem segredo.
- Componentes client devem ficar restritos a formularios, filtros interativos e estados de UI.
- Regras de negocio devem ficar em services, nao diretamente em componentes React.
- Acesso a banco deve passar por repositories ou services claros.
- Clientes de banco, Supabase admin e Mercado Pago devem usar lazy initialization para evitar falhas no build.

## 4. Seguranca

Autorizacao nao pode depender apenas de middleware/proxy. Toda rota privada, Server Action e Route Handler sensivel deve revalidar permissao no servidor.

Regras obrigatorias:

- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client.
- Nunca expor `MERCADO_PAGO_ACCESS_TOKEN` no client.
- Nunca confiar em `role`, `userId`, `planStatus` ou `subscriptionStatus` enviados pelo browser.
- Validar entrada com Zod no servidor.
- Proteger rotas por sessao, role e plano.
- Usar constraints no banco para integridade.
- Usar transacoes em operacoes concorrentes, como aceitar candidatura.
- Nao expor CPF publicamente.
- Nao expor telefone/WhatsApp antes do aceite da candidatura.
- Nao gravar segredos em logs.
- Webhook do Mercado Pago deve validar assinatura `x-signature`.
- Webhook do Mercado Pago deve ser idempotente.
- Eventos brutos de webhook podem ser armazenados, mas sem segredos.
- Consultas publicas devem retornar apenas dados publicaveis.

Observacao importante sobre Next.js:

- Middleware/proxy pode ajudar com redirect rapido, mas nao e camada unica de seguranca.
- Autorizacao real deve ocorrer no servidor, perto da leitura/mutacao dos dados.

## 5. Autenticacao

Usar Supabase Auth.

Fluxo:

1. Usuario informa email, senha e role desejada.
2. Supabase envia codigo/link de verificacao por email.
3. Apos confirmacao, o sistema cria ou completa o `User` interno.
4. Usuario completa perfil de freelancer ou estabelecimento.
5. Trial de 7 dias e calculado a partir de `User.createdAt`.

Tabela interna `User` deve manter vinculo com Supabase:

```txt
User.supabaseAuthUserId -> auth.users.id
```

## 6. Planos e trial

Planos pagos:

- Freelancer: R$ 19,99 por mes
- Estabelecimento: R$ 99,99 por mes

Trial:

- 7 dias gratis a partir da data de cadastro.
- `trialStartsAt = createdAt`
- `trialEndsAt = createdAt + 7 dias`

Regra de acesso:

```txt
acesso liberado se:
- usuario esta dentro do periodo gratis
OU
- assinatura esta ativa/autorizada no Mercado Pago
OU
- usuario e ADMIN
```

Quando o trial expirar e nao houver assinatura ativa:

- Freelancer nao deve conseguir se candidatar.
- Estabelecimento nao deve conseguir criar/gerenciar novas vagas.
- Usuario deve ser direcionado para a tela de plano/assinatura.

## 7. Mercado Pago

Usar Mercado Pago Assinaturas/Preapproval.

Eventos relevantes de webhook:

- `payment`
- `subscription_preapproval`
- `subscription_authorized_payment`

Dados importantes a persistir:

- ID da assinatura/preapproval.
- ID do pagamento.
- ID do pagamento autorizado, quando houver.
- `external_reference`.
- Status e status detail.
- Valor.
- Moeda.
- Metodo de pagamento.
- Tipo de pagamento.
- Email do pagador.
- Data de pagamento.
- Payload bruto.
- Headers relevantes, como request id.

O webhook deve:

1. Receber POST.
2. Validar assinatura HMAC usando `x-signature`, `x-request-id` e query param `data.id`, conforme documentacao do Mercado Pago.
3. Registrar evento bruto em `MercadoPagoWebhookEvent`.
4. Ignorar evento ja processado.
5. Buscar detalhes no Mercado Pago quando necessario.
6. Atualizar `Subscription`.
7. Criar ou atualizar `PaymentHistory`.
8. Responder 200 rapidamente apos processar ou enfileirar processamento.

Variaveis de ambiente:

```env
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""
MERCADO_PAGO_FREELANCER_PLAN_ID=""
MERCADO_PAGO_ESTABLISHMENT_PLAN_ID=""
```

## 8. BrasilAPI e ViaCEP

### CNPJ

Usar BrasilAPI:

```txt
GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}
```

Endpoint interno:

```txt
GET /api/lookup/cnpj?cnpj=00000000000000
```

Uso:

- Cadastro de estabelecimento.
- Preenchimento automatico de dados basicos.

Campos aproveitados:

- CNPJ
- Razao social
- Nome fantasia
- Situacao cadastral
- CEP
- UF
- Municipio
- Bairro
- Logradouro
- Numero
- Complemento
- CNAE principal, se util

### CEP

Usar ViaCEP:

```txt
GET https://viacep.com.br/ws/{cep}/json/
```

Endpoint interno:

```txt
GET /api/lookup/cep?cep=00000000
```

Regras:

- Validar CEP com 8 digitos antes de consultar.
- Tratar CEP inexistente quando resposta tiver `erro: true`.
- Nao depender de ViaCEP para autorizacao, apenas preenchimento de endereco.

## 9. Catalogo de estabelecimentos

Rota publica:

```txt
/estabelecimentos
```

Filtros:

- Cidade
- Bairro
- Nome da rua/logradouro
- Nome do estabelecimento

Exemplo:

```txt
/estabelecimentos?cidade=Santo%20Andre&bairro=Centro&rua=Oliveira&nome=Bar
```

Regras:

- Renderizar via SSR.
- Mostrar apenas estabelecimentos aprovados e publicos.
- Nao expor telefone, dados internos, status de assinatura ou informacoes sensiveis.
- Usar indices no banco para cidade, bairro, logradouro e nome.

## 10. Modelo de dados proposto

### User

```txt
id
supabaseAuthUserId
name
email
phone
role
emailVerifiedAt
trialStartsAt
trialEndsAt
createdAt
updatedAt
```

Roles:

```txt
ADMIN
ESTABLISHMENT
FREELANCER
```

### EstablishmentProfile

Dados basicos da empresa:

```txt
id
userId
tradeName
legalName
cnpj
whatsapp
email
type
description
status
createdAt
updatedAt
```

Endereco:

```txt
cep
state
city
neighborhood
street
number
complement
```

Status:

```txt
PENDING
APPROVED
BLOCKED
```

### FreelancerProfile

```txt
id
userId
fullName
cpf
whatsapp
email
city
neighborhood
street
cep
bio
experience
profilePhotoUrl
averageRating
status
createdAt
updatedAt
```

Status:

```txt
PENDING
APPROVED
BLOCKED
```

### Specialty

```txt
id
name
slug
category
active
createdAt
updatedAt
```

### FreelancerSpecialty

```txt
id
freelancerId
specialtyId
createdAt
```

Constraint:

```txt
unique(freelancerId, specialtyId)
```

### Availability

```txt
id
freelancerId
dayOfWeek
startTime
endTime
available
createdAt
updatedAt
```

Observacao:

- Para o MVP, disponibilidade por dia da semana e suficiente.
- Futuramente pode haver disponibilidade por data especifica.

### JobPost

```txt
id
establishmentId
title
description
specialtyId
city
neighborhood
street
number
cep
workDate
startTime
endTime
paymentType
paymentValue
quantity
requirements
status
createdAt
updatedAt
```

Status:

```txt
OPEN
IN_REVIEW
FILLED
CANCELLED
FINISHED
```

PaymentType:

```txt
DAILY
HOURLY
FIXED
```

### JobApplication

```txt
id
jobPostId
freelancerId
message
status
acceptedAt
rejectedAt
cancelledAt
completedAt
createdAt
updatedAt
```

Status:

```txt
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

Constraint:

```txt
unique(jobPostId, freelancerId)
```

Regra:

- Aceite deve ocorrer em transacao.
- Nao aceitar mais candidatos do que `JobPost.quantity`.
- Quando quantidade aceita atingir `quantity`, vaga muda para `FILLED`.

### Plan

```txt
id
role
name
description
priceCents
currency
trialDays
mercadoPagoPreapprovalPlanId
active
createdAt
updatedAt
```

Planos iniciais:

```txt
Freelancer Mensal - 1999 - BRL - 7 dias trial
Estabelecimento Mensal - 9999 - BRL - 7 dias trial
```

### Subscription

```txt
id
userId
planId
provider
status
mercadoPagoPreapprovalId
mercadoPagoPayerId
startedAt
trialEndsAt
currentPeriodStart
currentPeriodEnd
cancelledAt
createdAt
updatedAt
```

Status:

```txt
TRIALING
ACTIVE
AUTHORIZED
PENDING
PAUSED
CANCELLED
EXPIRED
PAST_DUE
```

### PaymentHistory

```txt
id
userId
subscriptionId
provider
mercadoPagoPaymentId
mercadoPagoPreapprovalId
mercadoPagoAuthorizedPaymentId
externalReference
protocol
paymentCode
status
statusDetail
amountCents
currency
paymentMethodId
paymentTypeId
installments
payerEmail
paidAt
rawPayload
createdAt
updatedAt
```

Constraints sugeridas:

```txt
unique(provider, mercadoPagoPaymentId)
```

### MercadoPagoWebhookEvent

```txt
id
eventId
type
action
dataId
requestId
signature
payload
processedAt
createdAt
```

Constraints sugeridas:

```txt
unique(eventId)
unique(requestId, dataId, action)
```

## 11. Rotas

### Publicas

```txt
/
/vagas
/vagas/[id]
/estabelecimentos
/estabelecimentos/[id]
/login
/cadastro
/cadastro/freelancer
/cadastro/estabelecimento
/planos
```

### Freelancer

```txt
/app/freelancer
/app/freelancer/perfil
/app/freelancer/especialidades
/app/freelancer/disponibilidade
/app/freelancer/candidaturas
/app/freelancer/plano
```

### Estabelecimento

```txt
/app/estabelecimento
/app/estabelecimento/perfil
/app/estabelecimento/vagas
/app/estabelecimento/vagas/nova
/app/estabelecimento/vagas/[id]
/app/estabelecimento/vagas/[id]/candidatos
/app/estabelecimento/plano
```

### Admin

```txt
/admin
/admin/usuarios
/admin/estabelecimentos
/admin/freelancers
/admin/vagas
/admin/especialidades
/admin/planos
/admin/pagamentos
```

### APIs internas

```txt
/api/lookup/cnpj
/api/lookup/cep
/api/mercadopago/subscription
/api/mercadopago/webhook
```

## 12. Estrutura de pastas pretendida

```txt
src/
  app/
    (public)/
      page.tsx
      vagas/
      estabelecimentos/
      login/
      cadastro/
      planos/
    app/
      freelancer/
      estabelecimento/
    admin/
    api/
      lookup/
        cnpj/
        cep/
      mercadopago/
        subscription/
        webhook/
  components/
    ui/
    forms/
    layout/
    cards/
    filters/
  lib/
    auth/
    env.ts
    prisma.ts
    supabase/
    mercadopago/
    validators/
    utils.ts
  server/
    actions/
    services/
    repositories/
    guards/
  types/
prisma/
  schema.prisma
  seed.ts
```

## 13. Guards obrigatorios

Criar helpers de servidor:

```txt
requireUser()
requireRole(role)
requireActiveAccess()
requireEstablishment()
requireFreelancer()
requireAdmin()
assertResourceOwner()
```

Uso:

- Paginas privadas chamam guard no Server Component.
- Server Actions chamam guard antes de qualquer mutacao.
- Route Handlers sensiveis validam token/webhook/secret conforme o caso.

## 14. Ordem de implementacao

1. Clonar e inspecionar repositorio.
2. Criar `codex.md` com escopo, arquitetura, seguranca e plano.
3. Criar scaffold Next.js com TypeScript, App Router e Tailwind.
4. Ajustar configuracoes iniciais.
5. Instalar Prisma, Supabase, Zod, React Hook Form, shadcn/ui e Mercado Pago.
6. Configurar variaveis de ambiente e `.env.example`.
7. Criar schema Prisma.
8. Criar seed de planos e especialidades.
9. Configurar Supabase Auth.
10. Criar camada de auth/guards SSR.
11. Criar cadastro e verificacao de email.
12. Criar cadastro de freelancer.
13. Criar cadastro de estabelecimento.
14. Criar endpoints de CNPJ e CEP.
15. Criar catalogo de estabelecimentos com filtros SSR.
16. Criar CRUD de vagas.
17. Criar candidatura de freelancer.
18. Criar aceite/recusa com transacao.
19. Criar tela de planos e assinatura.
20. Integrar Mercado Pago.
21. Criar webhook seguro e historico de pagamentos.
22. Criar admin basico.
23. Testar fluxo completo.
24. Preparar deploy na Vercel.

## 15. Etapas ja executadas

### 15.1 Repositorio

- Repositorio clonado de `https://github.com/Cosmess/abc-freelancer`.
- Estrutura inicial inspecionada.
- O repositorio estava praticamente vazio, contendo apenas `README.md` e `.gitignore`.
- Projeto iniciado diretamente em `C:\projetos\abc-freelancer`.

### 15.2 Documentacao

- Criado `codex.md` com:
  - objetivo do produto;
  - stack definida;
  - arquitetura SSR;
  - regras de seguranca;
  - estrategia de autenticacao;
  - planos e trial de 7 dias;
  - integracao Mercado Pago;
  - integracoes BrasilAPI e ViaCEP;
  - catalogo de estabelecimentos;
  - modelo de dados;
  - rotas;
  - estrutura de pastas;
  - ordem de implementacao.

### 15.3 Scaffold Next.js

- Criado scaffold Next.js em pasta temporaria e copiado para o repositorio.
- Stack inicial gerada:
  - Next.js `16.2.7`;
  - React `19.2.4`;
  - TypeScript;
  - App Router;
  - Tailwind CSS v4;
  - ESLint;
  - Turbopack.
- Ajustado `package.json` para usar o nome `abc-freelancer`.
- Ajustados metadados em `src/app/layout.tsx`.
- Idioma do HTML alterado para `pt-BR`.
- Corrigida configuracao de fonte no `globals.css` para evitar referencia circular do Tailwind v4/shadcn.

### 15.4 UI inicial

- shadcn/ui inicializado.
- Criados:
  - `components.json`;
  - `src/components/ui/button.tsx`;
  - `src/lib/utils.ts`.
- Home padrao do Next.js substituida por uma primeira tela do produto em `src/app/page.tsx`.
- A tela inicial contem:
  - apresentacao do ABC Freelancer;
  - busca por cidade, bairro e especialidade;
  - links para catalogo, cadastro de freelancer e cadastro de estabelecimento.

### 15.5 Dependencias instaladas

Dependencias principais instaladas:

- `@prisma/client`
- `@prisma/adapter-pg`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `mercadopago`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `pg`

Dependencias de desenvolvimento:

- `prisma`
- `dotenv`
- `tsx`

### 15.6 Prisma

- Prisma inicializado.
- Criados:
  - `prisma/schema.prisma`;
  - `prisma.config.ts`;
  - `prisma/seed.ts`.
- Schema Prisma criado com:
  - enums de role, status, assinatura, vaga, candidatura e pagamento;
  - `User`;
  - `EstablishmentProfile`;
  - `FreelancerProfile`;
  - `Specialty`;
  - `FreelancerSpecialty`;
  - `Availability`;
  - `JobPost`;
  - `JobApplication`;
  - `Plan`;
  - `Subscription`;
  - `PaymentHistory`;
  - `MercadoPagoWebhookEvent`;
  - `Review`.
- Incluidas constraints importantes:
  - usuario vinculado ao `supabaseAuthUserId`;
  - email unico;
  - CNPJ unico;
  - CPF unico opcional;
  - especialidade unica por freelancer;
  - candidatura unica por vaga/freelancer;
  - pagamento Mercado Pago unico por provider/payment id;
  - eventos de webhook com indices/uniques para idempotencia.
- Criado seed inicial de:
  - especialidades;
  - plano Freelancer Mensal, R$ 19,99;
  - plano Estabelecimento Mensal, R$ 99,99.
- Prisma Client gerado em `src/generated/prisma`.
- `src/generated/prisma` esta ignorado no Git e e regerado por script.

### 15.7 Helpers de infraestrutura

Criados helpers:

- `src/lib/env.ts`
  - `requireEnv`;
  - `optionalEnv`.
- `src/lib/prisma.ts`
  - singleton lazy do Prisma com adapter `pg`.
- `src/lib/supabase/server.ts`
  - cliente Supabase para Server Components/Route Handlers com cookies.
- `src/lib/supabase/admin.ts`
  - cliente Supabase admin com service role, sem persistencia de sessao.
- `src/lib/mercadopago/client.ts`
  - cliente Mercado Pago com lazy initialization.

### 15.8 Variaveis de ambiente

- Criado `.env.example` com:
  - `DATABASE_URL`;
  - `DIRECT_URL`;
  - `NEXT_PUBLIC_APP_URL`;
  - `NEXT_PUBLIC_SUPABASE_URL`;
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
  - `SUPABASE_SERVICE_ROLE_KEY`;
  - `MERCADO_PAGO_ACCESS_TOKEN`;
  - `MERCADO_PAGO_WEBHOOK_SECRET`;
  - `MERCADO_PAGO_FREELANCER_PLAN_ID`;
  - `MERCADO_PAGO_ESTABLISHMENT_PLAN_ID`.
- Ajustado `.gitignore` para ignorar `.env*`, mas permitir versionar `.env.example`.

### 15.9 Scripts

Scripts atuais:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:validate
npm run db:push
npm run db:seed
```

Tambem foi adicionado:

```bash
npm run postinstall
```

O `postinstall` executa `prisma generate`.

### 15.10 Validacoes executadas

Comandos executados com sucesso:

```bash
npm run prisma:validate
npm run prisma:generate
npm run lint
npm run build
```

Resultado:

- Prisma schema valido.
- Prisma Client gerado.
- ESLint sem erros.
- Build de producao do Next.js concluido com sucesso.
- Aplicacao respondeu `200` em `http://localhost:3000`.

Observacao:

- `npm audit` reportou vulnerabilidades moderadas em dependencias.
- Nao foi executado `npm audit fix --force`, pois isso pode alterar versoes de forma agressiva e quebrar o scaffold.

## 16. Status de execucao

- [x] Repositorio clonado de `https://github.com/Cosmess/abc-freelancer`
- [x] Estrutura inicial inspecionada
- [x] Documento `codex.md` criado
- [x] Scaffold Next.js criado
- [x] Dependencias instaladas
- [x] Prisma configurado
- [x] Schema Prisma criado
- [x] Seed inicial criado
- [x] shadcn/ui configurado
- [x] Home inicial criada
- [x] `.env.example` criado
- [x] Helpers de ambiente criados
- [x] Helper Prisma criado
- [x] Helpers Supabase criados
- [x] Helper Mercado Pago criado
- [x] Lint executado com sucesso
- [x] Build executado com sucesso
- [x] Servidor local testado em `http://localhost:3000`
- [ ] Banco Supabase criado/configurado
- [ ] `DATABASE_URL` real configurada
- [ ] Migracao/schema aplicado no banco real
- [ ] Seed executado no banco real
- [ ] Supabase Auth configurado no painel
- [ ] Fluxo real de verificacao de email implementado
- [ ] Guards SSR implementados
- [ ] Cadastro de freelancer implementado
- [ ] Cadastro de estabelecimento implementado
- [ ] Lookup de CNPJ implementado
- [ ] Lookup de CEP implementado
- [ ] Catalogo de estabelecimentos implementado
- [ ] CRUD de vagas implementado
- [ ] Candidatura implementada
- [ ] Aceite/recusa com transacao implementado
- [ ] Mercado Pago configurado
- [ ] Tela de planos implementada
- [ ] Criacao de assinatura Mercado Pago implementada
- [ ] Webhook Mercado Pago implementado
- [ ] Historico de pagamentos implementado na interface
- [ ] Admin basico implementado
- [ ] Fluxo principal testado de ponta a ponta
- [ ] Deploy Vercel configurado

## 17. Proximas etapas recomendadas

### Etapa 1 - Banco e ambiente

1. Criar projeto Supabase.
2. Copiar `DATABASE_URL` e `DIRECT_URL` reais para `.env`.
3. Configurar `NEXT_PUBLIC_SUPABASE_URL`.
4. Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Configurar `SUPABASE_SERVICE_ROLE_KEY`.
6. Rodar:

```bash
npm run db:push
npm run db:seed
```

### Etapa 2 - Auth e seguranca

1. Implementar leitura da sessao Supabase no servidor.
2. Criar sincronizacao entre `auth.users` e tabela `User`.
3. Implementar guards:

```txt
requireUser()
requireRole(role)
requireActiveAccess()
requireEstablishment()
requireFreelancer()
requireAdmin()
assertResourceOwner()
```

4. Criar rotas de login, cadastro e confirmacao.
5. Garantir que toda pagina privada valide sessao no servidor.
6. Garantir que toda Server Action valide role/plano/propriedade.

### Etapa 3 - Cadastros

1. Cadastro de freelancer.
2. Cadastro de estabelecimento.
3. Consulta CNPJ via BrasilAPI.
4. Consulta CEP via ViaCEP.
5. Validacoes com Zod.
6. Criacao automatica do trial de 7 dias.

### Etapa 4 - Marketplace

1. Catalogo de estabelecimentos com filtros SSR.
2. Vitrine de vagas.
3. CRUD de vagas para estabelecimento.
4. Candidatura do freelancer.
5. Aceite/recusa com transacao.
6. Liberacao controlada de contato apos aceite.

### Etapa 5 - Planos e pagamentos

1. Criar ou configurar planos no Mercado Pago.
2. Implementar tela de planos.
3. Criar assinatura/preapproval.
4. Implementar webhook com validacao de assinatura.
5. Atualizar `Subscription`.
6. Registrar `PaymentHistory`.
7. Bloquear acesso apos trial vencido sem assinatura ativa.

### Etapa 6 - Admin e deploy

1. Admin basico para usuarios, perfis, vagas e pagamentos.
2. Revisao de seguranca.
3. Teste completo.
4. Configuracao Vercel.
5. Configuracao de variaveis de ambiente na Vercel.
6. Deploy.

## 18. Decisoes pendentes

Antes da integracao real em producao, definir:

- Se as assinaturas do Mercado Pago serao com plano associado ou sem plano associado.
- URL final de producao para `NEXT_PUBLIC_APP_URL`.
- Credenciais Supabase.
- Credenciais Mercado Pago de teste e producao.
- Politica exata de bloqueio apos trial vencido.
- Se admin aprova manualmente todos os perfis ou se alguns entram aprovados automaticamente.

## 19. Observacoes de desenvolvimento

- O projeto ainda nao tem banco real conectado.
- O `.env` gerado pelo Prisma contem valor local/temporario e nao deve ser versionado.
- O arquivo versionavel correto para referencia e `.env.example`.
- O servidor local ja foi iniciado anteriormente e respondeu em `http://localhost:3000`.
- Como `src/generated/prisma` e gerado, ele nao deve ser editado manualmente.
- As proximas mudancas devem priorizar auth e guards antes de telas privadas.
