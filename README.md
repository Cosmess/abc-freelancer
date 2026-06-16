# ABC Freelancer

ABC Freelancer e uma plataforma web para conectar estabelecimentos do ABC Paulista com freelancers para diarias, turnos e vagas pontuais.

## Como funciona

1. Usuario cria conta como freelancer ou estabelecimento.
2. Confirma o email ou entra com Google.
3. Completa o perfil.
4. Estabelecimento cria vagas.
5. Freelancer busca vagas e se candidata.
6. Estabelecimento aceita ou recusa.
7. O contato so e liberado quando a regra do fluxo permite.
8. Apos o trial, catalogos e vagas exigem plano ativo.

## Tecnologias

- Next.js 16 App Router
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

## Funcionalidades recentes

- Validacao campo a campo nas telas de cadastro, sem apagar os dados digitados.
- Login e cadastro com Google via Supabase Auth.
- Recuperacao de senha com rota dedicada para troca de senha.
- Bloqueio de vagas, catalogos e gestao de candidatos quando o trial expira e nao existe assinatura ativa.
- Imagem Open Graph em `public/og-image.svg` para preview em WhatsApp e redes sociais.

## Rodar localmente

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts uteis

```bash
npm run lint
npm run build
npm run prisma:validate
npm run db:seed
```

## Documentacao

- [docs/codex.md](./docs/codex.md)
- [docs/README.md](./docs/README.md)
- [docs/spec-driven-development/README.md](./docs/spec-driven-development/README.md)

## Arquitetura

- `src/app`: rotas e paginas.
- `src/components`: formularios, layout e UI.
- `src/lib`: regras de dominio, clientes externos e helpers.
- `src/server`: guards e Server Actions.
- `prisma`: schema e seed.
- `public`: assets publicos, incluindo favicon e imagem social.

## Deploy

O projeto e publicado na Vercel.

Antes do deploy, valide:

1. `npm run lint`
2. `npm run build`
3. `npm run db:push` quando o schema mudar
