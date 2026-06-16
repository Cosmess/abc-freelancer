# ABC Freelancer - Project Codex

Guia central do projeto. Leia em ordem para entender rapidamente o produto, a arquitetura e as regras que o codigo segue.

## Ordem de leitura

1. `spec-driven-development/README.md`
2. `spec-driven-development/product.md`
3. `spec-driven-development/architecture.md`
4. `spec-driven-development/data-model.md`
5. `spec-driven-development/flows.md`
6. `spec-driven-development/operations.md`
7. `spec-driven-development/roadmap.md`

## O que e o projeto

ABC Freelancer e uma plataforma para conectar estabelecimentos do ABC Paulista com freelancers para diarias, turnos e vagas pontuais.

## Estado atual

- Next.js 16 App Router.
- TypeScript.
- Tailwind CSS v4 e shadcn/ui.
- Supabase Auth para login e cadastro.
- Login/cadastro com Google via Supabase Auth.
- Supabase Postgres para persistencia.
- Supabase Storage para fotos de perfil e logos.
- Prisma como schema e modelagem.
- Server Actions para mutacoes.
- Route Handlers para integracoes e lookups.

## Fluxo principal

1. Usuario cria conta.
2. Usuario confirma email ou entra com Google.
3. Usuario completa perfil.
4. Estabelecimento cria vaga.
5. Freelancer busca vaga e se candidata.
6. Estabelecimento aceita ou recusa.
7. Contato so e liberado quando a regra de negocio permite.

## Regras de negocio importantes

- Freelancer nao deve ver WhatsApp do estabelecimento antes do aceite.
- Estabelecimento nao deve ver WhatsApp do freelancer antes do aceite.
- Vaga so some da busca quando for excluida ou encerrada.
- Se uma candidatura for aceita e depois recusada, a vaga pode voltar a aparecer se nao houver mais aceites.
- Fotos sao comprimidas no navegador antes do upload.
- Cadastro valida campo a campo no client e tambem valida no servidor.
- Trial expirado sem assinatura ativa bloqueia vagas, catalogos e gestao de candidatos.
- Recuperacao de senha usa `/auth/esqueci-senha`, `/auth/recuperar-senha` e `/auth/nova-senha`.
- Preview social usa `public/og-image.svg` via metadata Open Graph.

## Onde olhar no codigo

- `src/app`
- `src/components`
- `src/lib`
- `src/server`
- `prisma/schema.prisma`
