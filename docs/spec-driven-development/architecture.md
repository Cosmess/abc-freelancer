# Architecture Spec

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Prisma
- Zod
- Vercel

## Camadas

- `src/app`: rotas, paginas e route handlers.
- `src/components`: UI e formularios.
- `src/lib`: regras de dominio e helpers.
- `src/server`: actions e guards.
- `prisma`: schema e seed.

## Areas principais do app

- Publico: `/`, `/login`, `/cadastro`, `/vagas`, `/estabelecimentos`.
- Freelancer: `/app/freelancer`, `/app/freelancer/perfil`, `/app/freelancer/candidaturas`, `/app/freelancer/plano`.
- Estabelecimento: `/app/estabelecimento`, `/app/estabelecimento/perfil`, `/app/estabelecimento/vagas`, `/app/estabelecimento/vagas/nova`, `/app/estabelecimento/vagas/[id]/candidatos`, `/app/estabelecimento/plano`.
- Admin: `/admin` existe como rota protegida reservada, sem tela operacional no escopo imediato.

## Padrão

- Server Components para leitura.
- Client Components para formularios e interacao.
- Server Actions para mutacoes.
- Route Handlers para integracoes externas.

## Regras de implementacao

- Toda mutacao critica valida sessao e permissao no servidor.
- O proxy pode redirecionar rapido, mas nao substitui guard.
- Dados sensiveis nunca devem depender apenas do que vem do browser.
- Lookups externos ficam em Route Handlers internos, nao no client direto.

## Integracoes atuais

- Supabase Auth: login, cadastro, reset e confirmacao de email.
- Supabase Storage: fotos de perfil e logos.
- ViaCEP: preenchimento de endereco por CEP.
- Google Maps: link gerado a partir do endereco da vaga.
- Mercado Pago Checkout Pro: criacao de preferencia, redirecionamento hospedado e webhook de pagamento.
