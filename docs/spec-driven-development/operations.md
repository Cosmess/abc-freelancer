# Operations Spec

## Rodar localmente

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

## Validar

```bash
npm run lint
npm run build
```

## Banco

- `npm run db:push` aplica o schema no Supabase.
- `npm run db:seed` popula especialidades e planos.
- `npm run prisma:generate` regenera o client.

## Variaveis principais

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`

## Mercado Pago

- O app usa Checkout Pro com pagamentos avulsos.
- O controle de plano e expiracao de acesso fica no banco do app.
- Pagamentos aprovados pelo Mercado Pago iniciam um ciclo local de 30 dias.
- Se o usuario renovar antes da expiraçao, o novo ciclo recomeça a partir do ultimo pagamento aprovado.
- Quando o pagamento e aprovado, o trial do usuario termina na mesma data.
- Cancelamento dentro de 7 dias do pagamento dispara reembolso integral via `POST /v1/payments/{id}/refunds`.
- Fora da janela de 7 dias, o cancelamento apenas encerra a assinatura no banco e mantem o acesso ate `currentPeriodEnd`.
- A tela de plano exibe a data de pagamento, inicio do plano, expiraçao e o historico de reembolso quando existir.
- Nao usa Checkout Transparente, Public Key no frontend ou assinatura recorrente `PreApproval`.

## Deploy

- Publicar na Vercel.
- Aplicar mudancas de schema com `npm run db:push`.

## Verificacao manual util

- Home com sessao ativa.
- Login com sessao ativa redirecionando.
- Upload de foto.
- Criacao de vaga.
- Candidatura e aceite.
- Liberacao de WhatsApp.
